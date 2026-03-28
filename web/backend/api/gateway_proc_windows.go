//go:build windows

package api

import "syscall"

func gatewayProcAttr() *syscall.SysProcAttr {
	return nil
}
