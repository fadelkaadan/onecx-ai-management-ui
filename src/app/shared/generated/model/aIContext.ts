/**
 * onecx-ai-management-bff
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { AIKnowledgeUrl } from './aIKnowledgeUrl';
import { AIKnowledgeBase } from './aIKnowledgeBase';
import { AIKnowledgeDatabase } from './aIKnowledgeDatabase';
import { AIKnowledgeDocument } from './aIKnowledgeDocument';
import { AIKnowledgeVectorDb } from './aIKnowledgeVectorDb';
import { AIProvider } from './aIProvider';


export interface AIContext { 
    id?: string;
    appId?: string;
    name?: string;
    description?: string;
    modificationCount?: number;
    modificationUser?: string;
    creationUser?: string;
    provider?: AIProvider;
    AIKnowledgeBase?: AIKnowledgeBase;
    aIKnowledgeVectorDb?: AIKnowledgeVectorDb;
    aIKnowledgeUrl?: Array<AIKnowledgeUrl>;
    aIKnowledgeDbs?: Array<AIKnowledgeDatabase>;
    aIKnowledgeDocuments?: Array<AIKnowledgeDocument>;
}

