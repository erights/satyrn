[BTRC](btcr.md)

# DIDs
Decentralized Identifiers (DIDs) are a standards-track specification under development at the World Wide Web Consortium (http://w3.org). Current draft at https://github.com/w3c-ccg/did-spec
DIDs are URIs that resolve to DID Documents, which can be used for secure interactions with the controller of the DID. In other words, given a specific DID, you can look up the definitive DID Document and use the information in that DID Document for cryptographically secured interactions, including communications, signing, authentication, and verification.

### Snippet 1: An example BTCR DID
```
did:btcr:8kyt-fzzq-qpqq-ljsc-5l
```

All DIDs have the following structure.
Snippet 2: Root ABNF for DIDs
did = "did:" method-name ":" method-specific-id

Every DID includes what is called the DID Method (the method-name in Snippet 2), which declares which specification to use to perform supported DID operations like create, read, update, and deactivate. In Snippet 1, the method is btcr. You can see the publicly announced DID Methods at https://github.com/w3c-ccg/did-method-registry. Each method has a specification and each specifications defines all supported operations for that method.

The method specific ID, **8kyt-fzzq-qpqq-ljsc-5l** in Snippet 1 is the unique identifier used by the BTCR DID Method to retrieve the definitive DID Document for that ID. Each DID leads to a different DID Document through a process called resolution, and the precise mechanisms for resolution vary from method to method. In this tutorial, we are focused expressly on the BTCR DID method, which we’ll introduce shortly.

DIDs may also be composed into DID-URLs which contain additional parameters that get applied after resolution. Although BTCR fully supports DID-URLs, this tutorial does not address DID-URLs.
DID Documents
The DID Document for a given DID contains public keys, authentications, and service endpoints. 
### Snippet 3: A simple DID Document (from example 16 in the did spec)
> EXAMPLE 16: A simple DID Document
> ```json
{
  "@context": "https://example.org/example-method/v1",
  "id": "did:example:123456789abcdefghi",
  "publicKey": [{ ... }],
  "authentication": [{ ... }],
  "service": [{ ... }]
}
```

The public keys are used for cryptographically secure interactions. The authentications are used for authenticating a user as a legitimate representative of the ID. The services are used for communicating or interacting with the subject of the DID.

**NOTE**: The subject of a given DID—the entity referred to by the identifier—is typically also the controller of the DID, but may not be. When it is, we can think of the DID and DID Document as providing the means for interacting with the Subject. However, in cases of stewardship, guardianship, or devices, the controller of the DID may or not be the Subject. For example, a DID that refers to a smart home device might be under the control of the owner of that device and specify authentication mechanisms the device uses when interacting with other services. 

For simplicity and clarity, this tutorial will only deal with BTCR DIDs that refer to a specific individual.
BTCR
