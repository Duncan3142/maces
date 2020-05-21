build:
	podman build -t pg .

start:
	podman pod create -p 8080 -n macespod && podman run -d --name pg --pod macespod pg && podman logs -f pg

stop:
	podman stop pg && podman rm pg && podman pod rm macespod
