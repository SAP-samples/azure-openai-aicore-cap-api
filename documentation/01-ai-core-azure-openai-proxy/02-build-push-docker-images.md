# Docker (optional)

If you want to build a docker image of the python proxy on your own, you need to have a docker account on Docker Hub. The following explains how to setup such an account and also how to build and push the docker image to Docker Hub that SAP AI Core is able to fetch the built image of the proxy.

## Create an account on Docker Hub

In later stages of this mission, it's required to build docker images for the training phase and for the inference service. Those docker images must be hosted in a repository that can be accessed from SAP AI Core, such as Docker Hub. Therefore, let's create an account on [Docker Hub](https://hub.docker.com/) if you didn't get one already.

## Build and push Docker Images of the implementations for Training and Inference

AI Core will run the the serving script _proxy.py_ in a Docker container in the cloud. Therefore, you first have to build the
Dockerfiles and then push them to your Docker Hub repository. To execute the needed Docker
commands install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your operating system if it is not installed already.

To do that, change your working directory to _proxy/_ in your
terminal. Notice this directory contains a Dockerfile. Now run the
following command to build the Dockerfile and to get a Docker image:

```bash
docker build -t <PATH-TO-DOCKERHUB-REPO>:<IMAGE-TAG> .
```

Here `<IMAGE-TAG>` is the tag you want to give your image as a name. Then push this Docker image
to the Docker Hub repository by running:

```bash
docker push docker.io/<PATH-TO-DOCKERHUB-REPO>:<IMAGE-TAG>
```

Finally, take a look at your repository in Docker Hub and double check that the image has been pushed successfully.
