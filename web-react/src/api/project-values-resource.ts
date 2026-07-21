/**
 * Project value attribute resource modules.
 *
 * Covers statuses, points, priorities, severities, types, swimlanes and
 * due-dates — all of which share a similar CRUD shape.
 */
import { deleteJson, getJson, patchJson, postJson, putJson } from "./client";
import { resolveUrl, UrlName } from "./urls";

export interface ProjectValue {
  id: number;
  project: number;
  name: string;
  order: number;
  color?: string;
  is_closed?: boolean;
  by_default?: boolean;
}

function makeResource<T extends ProjectValue>(urlName: UrlName) {
  const baseUrl = resolveUrl(urlName);
  return {
    list(projectId: number): Promise<T[]> {
      return getJson<T[]>(baseUrl, { project: projectId });
    },
    get(id: number): Promise<T> {
      return getJson<T>(`${baseUrl}/${id}`);
    },
    create(data: Partial<T>): Promise<T> {
      return postJson<T, Partial<T>>(baseUrl, data);
    },
    update(id: number, data: Partial<T>): Promise<T> {
      return patchJson<T, Partial<T>>(`${baseUrl}/${id}`, data);
    },
    replace(id: number, data: Partial<T>): Promise<T> {
      return putJson<T, Partial<T>>(`${baseUrl}/${id}`, data);
    },
    remove(id: number, moveTo?: number): Promise<void> {
      const params = typeof moveTo === "number" ? { moveTo } : undefined;
      return deleteJson(`${baseUrl}/${id}`, { params });
    },
  };
}

export const epicStatusesResource = makeResource<ProjectValue>("epic-statuses");
export const userstoryStatusesResource = makeResource<ProjectValue>(
  "userstory-statuses",
);
export const userstoryDueDatesResource = makeResource<ProjectValue>(
  "userstory-due-dates",
);
export const taskStatusesResource = makeResource<ProjectValue>("task-statuses");
export const taskDueDatesResource = makeResource<ProjectValue>("task-due-dates");
export const issueStatusesResource =
  makeResource<ProjectValue>("issue-statuses");
export const issueDueDatesResource =
  makeResource<ProjectValue>("issue-due-dates");
export const issueTypesResource = makeResource<ProjectValue>("issue-types");
export const prioritiesResource = makeResource<ProjectValue>("priorities");
export const severitiesResource = makeResource<ProjectValue>("severities");
export const pointsResource = makeResource<ProjectValue>("points");
export const swimlanesResource = makeResource<ProjectValue>("swimlanes");

export const userstoryDueDatesActions = {
  createDefault(projectId: number): Promise<ProjectValue[]> {
    return postJson<ProjectValue[]>(
      resolveUrl("userstory-due-dates-create-default"),
      { project: projectId },
    );
  },
};

export const taskDueDatesActions = {
  createDefault(projectId: number): Promise<ProjectValue[]> {
    return postJson<ProjectValue[]>(
      resolveUrl("task-due-dates-create-default"),
      { project: projectId },
    );
  },
};

export const issueDueDatesActions = {
  createDefault(projectId: number): Promise<ProjectValue[]> {
    return postJson<ProjectValue[]>(
      resolveUrl("issue-due-dates-create-default"),
      { project: projectId },
    );
  },
};

export interface CustomAttribute {
  id: number;
  project: number;
  name: string;
  description?: string;
  type: string;
  order: number;
  extra?: unknown;
}

export type CustomAttributeEntity = "epic" | "userstory" | "task" | "issue";

function customAttributesUrl(entity: CustomAttributeEntity): string {
  return resolveUrl(`custom-attributes/${entity}` as UrlName);
}

function customAttributesValuesUrl(entity: CustomAttributeEntity): string {
  return resolveUrl(`custom-attributes-values/${entity}` as UrlName);
}

export const customAttributesResource = {
  list(
    entity: CustomAttributeEntity,
    projectId: number,
  ): Promise<CustomAttribute[]> {
    return getJson<CustomAttribute[]>(customAttributesUrl(entity), {
      project: projectId,
    });
  },
  create(
    entity: CustomAttributeEntity,
    data: Partial<CustomAttribute>,
  ): Promise<CustomAttribute> {
    return postJson<CustomAttribute, Partial<CustomAttribute>>(
      customAttributesUrl(entity),
      data,
    );
  },
  update(
    entity: CustomAttributeEntity,
    id: number,
    data: Partial<CustomAttribute>,
  ): Promise<CustomAttribute> {
    return patchJson<CustomAttribute, Partial<CustomAttribute>>(
      `${customAttributesUrl(entity)}/${id}`,
      data,
    );
  },
  remove(entity: CustomAttributeEntity, id: number): Promise<void> {
    return deleteJson(`${customAttributesUrl(entity)}/${id}`);
  },
};

export const customAttributesValuesResource = {
  get(
    entity: CustomAttributeEntity,
    objectId: number,
  ): Promise<{ attributes_values: Record<string, unknown>; version: number }> {
    return getJson(`${customAttributesValuesUrl(entity)}/${objectId}`);
  },
  update(
    entity: CustomAttributeEntity,
    objectId: number,
    data: { attributes_values: Record<string, unknown>; version: number },
  ): Promise<{ attributes_values: Record<string, unknown>; version: number }> {
    return patchJson(`${customAttributesValuesUrl(entity)}/${objectId}`, data);
  },
};
