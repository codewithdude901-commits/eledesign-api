import type { Field } from 'payload'

const readOnlyInternalAccess = {
  create: () => false,
  update: () => false,
}

export const cartItemB2BFields: Field[] = [
  {
    name: 'unitPrice',
    type: 'number',
    access: readOnlyInternalAccess,
    admin: {
      readOnly: true,
    },
    label: 'Unit price (cents)',
  },
  {
    name: 'lineTotal',
    type: 'number',
    access: readOnlyInternalAccess,
    admin: {
      readOnly: true,
    },
    label: 'Line total (cents)',
  },
  {
    name: 'b2bIssue',
    type: 'text',
    access: readOnlyInternalAccess,
    admin: {
      readOnly: true,
    },
    label: 'B2B validation issue',
  },
]

export const orderItemPriceFields: Field[] = [
  {
    name: 'unitPrice',
    type: 'number',
    access: readOnlyInternalAccess,
    admin: {
      readOnly: true,
    },
    label: 'Unit price (cents)',
  },
  {
    name: 'lineTotal',
    type: 'number',
    access: readOnlyInternalAccess,
    admin: {
      readOnly: true,
    },
    label: 'Line total (cents)',
  },
]

export const transactionItemPriceFields: Field[] = [
  {
    name: 'unitPrice',
    type: 'number',
    access: readOnlyInternalAccess,
    admin: {
      readOnly: true,
    },
    label: 'Unit price (cents)',
  },
  {
    name: 'lineTotal',
    type: 'number',
    access: readOnlyInternalAccess,
    admin: {
      readOnly: true,
    },
    label: 'Line total (cents)',
  },
]

const hasFields = (field: Field): field is Field & { fields: Field[] } =>
  'fields' in field && Array.isArray((field as { fields?: unknown }).fields)

export const injectArrayFields = (
  fields: Field[],
  arrayFieldName: string,
  extraFields: Field[],
): Field[] =>
  fields.map((field) => {
    if (field.type === 'tabs') {
      return {
        ...field,
        tabs: field.tabs.map((tab) => ({
          ...tab,
          fields: injectArrayFields(tab.fields, arrayFieldName, extraFields),
        })),
      }
    }

    if (field.type === 'array' && field.name === arrayFieldName) {
      return {
        ...field,
        fields: [...field.fields, ...extraFields],
      }
    }

    if (hasFields(field)) {
      return {
        ...field,
        fields: injectArrayFields(field.fields, arrayFieldName, extraFields),
      }
    }

    return field
  })
