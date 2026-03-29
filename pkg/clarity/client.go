package clarity

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// Config holds connection settings for the Clarity API.
// Values are read from clarity-config.json or environment variables
// (CLARITY_BASE_URL, CLARITY_API_KEY, CLARITY_WEBHOOK_SECRET).
type Config struct {
	BaseURL       string `json:"baseUrl"`
	APIKey        string `json:"apiKey"`
	WebhookSecret string `json:"webhookSecret"`
}

// LoadConfig loads Config from a JSON file, then overrides with env vars if set.
func LoadConfig(path string) (Config, error) {
	cfg := Config{
		BaseURL: "https://clarityco.co.uk",
	}
	if data, err := os.ReadFile(path); err == nil {
		if err := json.Unmarshal(data, &cfg); err != nil {
			return cfg, fmt.Errorf("clarity: invalid config file %q: %w", path, err)
		}
	}
	if v := os.Getenv("CLARITY_BASE_URL"); v != "" {
		cfg.BaseURL = v
	}
	if v := os.Getenv("CLARITY_API_KEY"); v != "" {
		cfg.APIKey = v
	}
	if v := os.Getenv("CLARITY_WEBHOOK_SECRET"); v != "" {
		cfg.WebhookSecret = v
	}
	return cfg, nil
}

// Impact represents the estimated impact of a code proposal.
type Impact string

const (
	ImpactLow      Impact = "low"
	ImpactMedium   Impact = "medium"
	ImpactHigh     Impact = "high"
	ImpactCritical Impact = "critical"
)

// ProposalStatus represents the lifecycle state of a proposal on Clarity.
type ProposalStatus string

const (
	StatusPending  ProposalStatus = "pending"
	StatusApproved ProposalStatus = "approved"
	StatusRejected ProposalStatus = "rejected"
	StatusDeployed ProposalStatus = "deployed"
)

// Proposal is the payload sent to Clarity when PicoCloud submits a code change.
type Proposal struct {
	FilePath     string `json:"filePath"`
	Title        string `json:"title"`
	Reason       string `json:"reason"`
	OriginalCode string `json:"originalCode"`
	ProposedCode string `json:"proposedCode"`
	Impact       Impact `json:"impact"`
	Source       string `json:"source"` // always "picocloud"
}

// ProposalResponse is what Clarity returns after receiving or querying a proposal.
type ProposalResponse struct {
	ID        string         `json:"id"`
	Status    ProposalStatus `json:"status"`
	FilePath  string         `json:"filePath"`
	Title     string         `json:"title"`
	Impact    Impact         `json:"impact"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	Message   string         `json:"message,omitempty"`
}

// Client is the HTTP client for the Clarity integration API.
type Client struct {
	cfg  Config
	http *http.Client
}

// NewClient creates a Client from the given Config.
func NewClient(cfg Config) *Client {
	return &Client{
		cfg:  cfg,
		http: &http.Client{Timeout: 30 * time.Second},
	}
}

// NewClientFromFile creates a Client by loading Config from path (env vars override).
func NewClientFromFile(path string) (*Client, error) {
	cfg, err := LoadConfig(path)
	if err != nil {
		return nil, err
	}
	return NewClient(cfg), nil
}

// SubmitProposal sends a code proposal to Clarity for review.
// Returns the created proposal with its assigned ID and initial status.
func (c *Client) SubmitProposal(p Proposal) (*ProposalResponse, error) {
	if p.Source == "" {
		p.Source = "picocloud"
	}
	return c.post("/api/v1/picocloud/propose", p)
}

// GetProposals returns all proposals submitted by PicoCloud.
func (c *Client) GetProposals() ([]ProposalResponse, error) {
	var result []ProposalResponse
	if err := c.get("/api/v1/picocloud/proposals", &result); err != nil {
		return nil, err
	}
	return result, nil
}

// GetProposal returns the current state of a single proposal by ID.
func (c *Client) GetProposal(id string) (*ProposalResponse, error) {
	return c.getOne(fmt.Sprintf("/api/v1/picocloud/proposals/%s", id))
}

// --- internal helpers ---

func (c *Client) post(path string, body any) (*ProposalResponse, error) {
	data, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("clarity: marshal request: %w", err)
	}
	req, err := http.NewRequest(http.MethodPost, c.cfg.BaseURL+path, bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("clarity: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.cfg.APIKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("clarity: POST %s: %w", path, err)
	}
	defer resp.Body.Close()

	return c.decodeOne(resp, path)
}

func (c *Client) getOne(path string) (*ProposalResponse, error) {
	req, err := http.NewRequest(http.MethodGet, c.cfg.BaseURL+path, nil)
	if err != nil {
		return nil, fmt.Errorf("clarity: build request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.cfg.APIKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("clarity: GET %s: %w", path, err)
	}
	defer resp.Body.Close()

	return c.decodeOne(resp, path)
}

func (c *Client) get(path string, out any) error {
	req, err := http.NewRequest(http.MethodGet, c.cfg.BaseURL+path, nil)
	if err != nil {
		return fmt.Errorf("clarity: build request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.cfg.APIKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("clarity: GET %s: %w", path, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("clarity: GET %s returned %d: %s", path, resp.StatusCode, string(body))
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

func (c *Client) decodeOne(resp *http.Response, path string) (*ProposalResponse, error) {
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("clarity: read response: %w", err)
	}
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("clarity: %s returned %d: %s", path, resp.StatusCode, string(body))
	}
	var result ProposalResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("clarity: decode response: %w (body: %s)", err, string(body))
	}
	return &result, nil
}
