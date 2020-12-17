/* Amplify Params - DO NOT EDIT
	AUTH_AMPLIFYTEXTRACT7F442847_USERPOOLID
	ENV
	REGION
	STORAGE_S3DIGITRADE_BUCKETNAME
Amplify Params - DO NOT EDIT */

exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }, 
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
