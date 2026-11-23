# OSG Portal

This is the web application for the OSG Portal

## Structure

This web app is broken into two components. The Flask app that runs the api 
and some choice webpages, and the documentation which is built using mkdocs. 

### Web App

The Flask app is found in the ```/portal``` directory. 

### Documentation

The documentation is automatically updated with GHA and is found at ```/documentation```. 
If you want to update the documentation you should do so on the [user-documenation repo](https://github.com/osg-htc/user-documentation).

## Development

### Running the Flask Server

This runs the web app components of the website, which means that the documentation will not work
as that is served by Apache. This is the preferred way to test the web app locally. 

Requires Python 3.10+. From the repository root:

```shell
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m portal.app
```

The app is then available at <http://localhost:9618>. It reads `config.py` from the repository root
(see [Required Config Values](#required-config-values)).

### Running Apache Container

To run the registration server locally, build and run the testing container image:

1.  Build the container image:

    ```shell
    docker build -t osg-portal-testing -f Dockerfile.testing .
    ```

1. Start the local portal:

    ```shell
    docker run --rm --name osg-portal -it -v ${PWD}:/srv -p 8443:443 osg-portal-testing
    ```
  

    If port 8443 is already in use, map a different host port (e.g. `-p 9443:443`).

1. Access the local portal in your browser by accessing <https://localhost:8443>.
   The container uses a self-signed certificate, so your browser will show a warning.

1. For a login shell to the portal, run the following:

    ```shell
    docker exec -it osg-portal /bin/bash
    ```
        

    Helpful log files can be found in `/var/log/httpd/` and `/var/log/condor/registration.log`.

Note that changes to files copied into the container image (e.g. `COPY` lines in `Dockerfile.testing`) will require
a rebuild of the container image.

## Required Config Values

The ```congig.py``` file can be added at root and should contain the follow attributes.

```python
SUPPORT_EMAIL="Cannon Lock <clock@morgridge.org>"

OIDC_REDIRECT_URI = "<SITE_DOMAIN>/callback"
ADMIN_EMAILS = ""

FRESHDESK_API_KEY = ""
FRESHDESK_API_URL = "https://opensciencegrid.freshdesk.com"

H_CAPTCHA_SITEKEY = "deb6e053-975d-4c72-86be-6c91fdf4babf"
H_CAPTCHA_SECRET = ""
```

## Deployment

Deployment for the Flask App is done manually and deployment for the documentation is automatic. 

### Manual Tagging

#### Production

To toggle a new production container you should tag a new release iterating on the previous tag. 

```
v<major>.<minor>.<bugFix>
```

If you make a new major release then ```<major>``` is incremented, and ```<minor>``` and ```<bugfix>``` will be 0. 

If you make a new minor release then ```<major``` is kept, ```<minor>``` is incremented, and ```<bugfix>``` will be 0. 

#### Development

For all Development images you should append ```.itb.<dev>``` with the ```v<major>.<minor>.<bugFix>``` tag 
being your targeted release tag.

```
v<major>.<minor>.<bugFix>.itb.<dev>
```

### Automated Tagging

When documentation is updated a doc tag is incremented and prepended to the current tag.

```
v<major>.<minor>.<bugFix>.<doc>
```

If Dev:

```
v<major>.<minor>.<bugFix>.itb.<dev>.<doc>
```

### Debugging on Kubernetes 

Couple nice lines to expedite debugging a container on kubernetes in the dev instance

```shell
POD_NAME=$(kubectl --namespace osgdev get pods | grep osg-portal | awk '{print $1}')
```

```shell
kubectl --namespace osgdev get pods | grep osg-portal
```

```shell
kubectl --namespace osgdev describe pods $POD_NAME
```

```shell
kubectl -n osgdev --since 30m logs deploy/flux | grep osg-portal |  scripts/fluxpipe 
```

```shell
kubectl exec --namespace osgdev -it $POD_NAME osg-portal -- bash
```