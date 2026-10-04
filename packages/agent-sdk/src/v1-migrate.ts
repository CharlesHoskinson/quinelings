import type {Thought,ValueType} from './v1-types.js';
// @ts-expect-error shared JavaScript has no declarations
import Migration from '../../../qdl-v1-migrate.js';
export interface MigrationInput {source:string;registryDigest:string;name:string;thought:Thought;types:Record<string,ValueType>;ports:Record<string,string>;evidenceClaims:Record<string,string>}
export interface MigrationPreview {format:'qdl-migration-preview';version:1;legacySource:string;legacySourceHash:string;targetRegistryDigest:string;mapping:({nodeId:string;kind:'constant'|'retained-operation'}|{nodeId:string;kind:'runtime-port';name:string})[];semanticChanges:string[];artifact:{source:string;sourceHash:string;program:unknown[];payload:unknown;ports:unknown[];order:string[]};evidence:'authored-conversion';executed:false}
/** Passive preview; call Session.recover({source:preview.artifact.source}) to explicitly admit it. */
export function migrateLegacy(input:MigrationInput):MigrationPreview{return Migration.migrateLegacy(input);}
