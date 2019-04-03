// Copyright 2019 Keybase, Inc. All rights reserved. Use of
// this source code is governed by the included BSD license.

package client

import (
	"github.com/keybase/client/go/libkb"
	keybase1 "github.com/keybase/client/go/protocol/keybase1"
	"golang.org/x/net/context"
)

type ResetUI struct {
	libkb.Contextified
	terminal    libkb.TerminalUI
	interactive bool
	ignore      bool
}

func (r ResetUI) ResetPrompt(ctx context.Context, arg keybase1.ResetPromptArg) (keybase1.ResetPromptResult, error) {
	return keybase1.ResetPromptResult_IGNORE, nil
}
