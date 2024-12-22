#!/bin/bash

# SSH 隧道配置
ssh -N -L 3001:autoselvbak-release.ns-tevyggd8.svc.cluster.local:3000 devbox@hzh.sealos.run -p 30217