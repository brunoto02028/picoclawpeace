package clarity

import (
	"fmt"
	"time"
)

// MockClient implements the same interface as Client but returns mock data.
// Use this for local testing before the Clarity endpoints are live.
type MockClient struct {
	proposals map[string]*ProposalResponse
	nextID    int
}

// NewMockClient creates a mock client with no stored proposals.
func NewMockClient() *MockClient {
	return &MockClient{
		proposals: make(map[string]*ProposalResponse),
		nextID:    1,
	}
}

// SubmitProposal stores the proposal locally and returns a fake response.
func (m *MockClient) SubmitProposal(p Proposal) (*ProposalResponse, error) {
	if p.Source == "" {
		p.Source = "picocloud"
	}
	id := fmt.Sprintf("prop_%03d", m.nextID)
	m.nextID++
	resp := &ProposalResponse{
		ID:        id,
		Status:    StatusPending,
		FilePath:  p.FilePath,
		Title:     p.Title,
		Impact:    p.Impact,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Message:   "[MOCK] Proposal received — awaiting Clarity review",
	}
	m.proposals[id] = resp
	return resp, nil
}

// GetProposals returns all mock proposals.
func (m *MockClient) GetProposals() ([]ProposalResponse, error) {
	result := make([]ProposalResponse, 0, len(m.proposals))
	for _, p := range m.proposals {
		result = append(result, *p)
	}
	return result, nil
}

// GetProposal returns a single mock proposal by ID.
func (m *MockClient) GetProposal(id string) (*ProposalResponse, error) {
	p, ok := m.proposals[id]
	if !ok {
		return nil, fmt.Errorf("clarity mock: proposal %q not found", id)
	}
	return p, nil
}

// Approve simulates a human approval in tests.
func (m *MockClient) Approve(id string) error {
	p, ok := m.proposals[id]
	if !ok {
		return fmt.Errorf("clarity mock: proposal %q not found", id)
	}
	p.Status = StatusApproved
	p.UpdatedAt = time.Now()
	p.Message = "[MOCK] Approved"
	return nil
}
