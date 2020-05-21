build:
	podman build -t maces .

start:
	podman run --user node:node -v $(CURDIR):/home/node/server:z -d --name maces --pod macespod maces && podman logs -f maces

stop:
	podman stop maces && podman rm maces
