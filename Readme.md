# Hopeman History Timeline Project

Thank you for showing interest in this project. This is a hobby project to collate history of our local area and place it in a range of contexts.

You can view the project at ```https://reddeer.studio/hopemanhistory/```.

## Use of Images

Images used in this website are not mine and I have tried to give credit links to all images used.  Where possible Creative Commons images are used and permission sought.

## Hosted on Azure

Using this project to learn a little about Azure and to add some additional capabilities to this app.  I am following a similar architecture to [https://github.com/mspnp/serverless-reference-implementation/tree/v0.1.0-update](https://github.com/mspnp/serverless-reference-implementation/tree/v0.1.0-update).

* Created a Static Hosted Website, which does not need to use an explicit Blob storage service.
  * This will add a Git workflow to automatically deploy the code under ```website``` to Azure.

Followed [https://docs.microsoft.com/en-gb/azure/static-web-apps/add-api?tabs=vanilla-javascript#create-the-api](https://docs.microsoft.com/en-gb/azure/static-web-apps/add-api?tabs=vanilla-javascript#create-the-api) to link an API to my static website.  Only downside is having to pay for the privilege per project.

```
# install Azure STatic Web Apps CLI
sudo npm install -g @azure/static-web-apps-cli
# install Azure Functions Core Tools
sudo npm install -g azure-functions-core-tools@3
# run our local server to see the result
# format is: swa start <local_website_directory> --api-location <api_directory>
swa start website --api-location api
```

Followed [https://stackoverflow.com/questions/67580229/azure-functions-deploying-fail-from-vs-code](https://stackoverflow.com/questions/67580229/azure-functions-deploying-fail-from-vs-code) to find out how to set the AzureWebJobsStorage variable so I could deploy my functions to Azure.  I needed to add a Storage Account first.

Followed [https://docs.microsoft.com/en-us/azure/azure-functions/functions-add-output-binding-cosmos-db-vs-code?tabs=in-process&pivots=programming-language-javascript](https://docs.microsoft.com/en-us/azure/azure-functions/functions-add-output-binding-cosmos-db-vs-code?tabs=in-process&pivots=programming-language-javascript) to work out how to link a Cosmos DB Account to my functions.  Due to Capacity issues in Europe I had to create my database instance in the US - not ideal but to get something up and running I have opted for this.

Note that the host.json file it talks about in the root directory of your project - actually means the api directory.

When testing the function binding I got an error:

```
The 'HttpExample' function is in error: Unable to configure binding 'outputDocument' of type 'cosmosDB'. This may indicate invalid function.json properties. Input string was not in a correct format.
```

To resolve I needed to remove the following lines:

```
"partitionKey": "",
"collectionThroughput": ""
```
