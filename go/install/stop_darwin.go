// Copyright 2019 Keybase, Inc. All rights reserved. Use of
// this source code is governed by the included BSD license.

package install

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/blang/semver"
	"github.com/keybase/client/go/install/libnativeinstaller"
	kbnminstaller "github.com/keybase/client/go/kbnm/installer"
	"github.com/keybase/client/go/launchd"
	"github.com/keybase/client/go/libkb"
	"github.com/keybase/client/go/logger"
	"github.com/keybase/client/go/mounter"
	"github.com/keybase/client/go/protocol/keybase1"
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
