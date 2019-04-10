package install

import (
	"context"
	"os"
	"path/filepath"

	"github.com/keybase/client/go/libkb"
)

func StopAllButService(mctx libkb.MetaContext) {
	cli, err := GetKBFSMountClient(mctx.G())
	if err != nil {
		mctx.Error("KillKBFS: Error in GetKBFSMountClient: %s", err.Error())
	}

	mountDir, err := cli.GetCurrentMountDir(context.TODO())
	if err != nil {
		mctx.Error("KillKBFS: Error in GetCurrentMountDir: %s", err.Error())
	} else {
		// open special "file". Errors not relevant.
		mctx.Debug("KillKBFS: opening .kbfs_unmount")
		os.Open(filepath.Join(mountDir, "\\.kbfs_unmount"))
		libkb.ChangeMountIcon(mountDir, "")
	}
}
