/**
 * onecx-ai-management-bff
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface AIKnowledgeDocumentCreateResponse { 
    id?: string;
    name: string;
    documentRefId: string;
    status?: AIKnowledgeDocumentCreateResponseStatusEnum;
}
export enum AIKnowledgeDocumentCreateResponseStatusEnum {
    New = 'NEW',
    Processing = 'PROCESSING',
    Embedded = 'EMBEDDED'
};



