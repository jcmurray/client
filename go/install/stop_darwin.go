// Copyright 2019 Keybase, Inc. All rights reserved. Use of
// this source code is governed by the included BSD license.

package install

import (
	"github.com/keybase/client/go/launchd"
	"github.com/keybase/client/go/libkb"
)

func StopAllButService(mctx libkb.MetaContext) {
	g := mctx.G()
	if libkb.IsBrewBuild {
		launchd.Stop(DefaultServiceLabel(g.Env.GetRunMode()), defaultLaunchdWait, g.Log)
	}
	TerminateApp(g, g.Log)
	UninstallKeybaseServices(g, g.Log)
	UninstallKBFSOnStop(g, g.Log)
	UninstallUpdaterService(g, g.Log)
}
