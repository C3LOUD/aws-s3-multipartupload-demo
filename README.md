## Directly run docker compose

### `docker compose up`

## (note) The instruction below is all automatically run by setup_localstack service, you can remove that service, and follow the instruction below.

## Create bucket on aws s3

### `aws --endpoint-url=http://localhost:4566 s3 mb s3://<AWS_BUCKET>` make bucket

## Add cors header to localstack aws server

### `docker exec -it <CONTAINER_NAME> aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors --bucket <AWS_BUCKET> --cors-configuration file:///opt/cors-config/cors.json` add cors header

## (notify) Remember setup aws credential for aws on local machine for local testing

### `aws configure` also setup the key value in docker.compose.yml

## (notify) Remember to add `s3ForcePathStyle` setting to ture while create aws s3 client object when running the local aws testing environment

## (optional) Automatic tool to migrate v2 syntax to v3

### `npx aws-sdk-js-codemod -t v2-to-v3 <PATH>` migrate aws-sdk javascript v2 to v3
