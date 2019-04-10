package install

import (
	"os"
	"path/filepath"

	"github.com/keybase/client/go/libkb"
)

func StopAllButService(mctx libkb.MetaContext) {
	mountdir, err := mctx.G().Env.GetMountDir()
	if err != nil {
		mctx.Error("StopAllButService: Error in GetCurrentMountDir: %s", err.Error())
	} else {
		// open special "file". Errors not relevant.
		mctx.Debug("StopAllButService: opening .kbfs_unmount")
		os.Open(filepath.Join(mountdir, "\\.kbfs_unmount"))
		libkb.ChangeMountIcon(mountdir, "")
	}
}
