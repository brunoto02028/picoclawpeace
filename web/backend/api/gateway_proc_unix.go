//go:build !windows

package api

import "syscall"

// gatewayProcAttr returns SysProcAttr that puts the gateway in its own
// process group. This prevents it from receiving signals (e.g. SIGTERM,
// SIGHUP) that are sent to picoclaw-web's process group, so the gateway
// keeps running when picoclaw-web is restarted or closed.
func gatewayProcAttr() *syscall.SysProcAttr {
	return &syscall.SysProcAttr{Setpgid: true}
}
