#!/bin/bash
PEER=$1
rsync -avz -e 'ssh -p 22' root@$PEER:/root/.optimism/ /root/.optimism/