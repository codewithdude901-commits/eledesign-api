import type { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
  slug: 'home-page',

  fields: [
    // -------------------------
    // Hero
    // -------------------------
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'slides',
          type: 'array',
          localized: true,
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'link',
              type: 'text',
            },
          ],
        },
      ],
    },

    // -------------------------
    // Path Selector
    // -------------------------
    {
      name: 'pathSelector',
      type: 'group',
      fields: [
        {
          name: 'sub_title',
          type: 'text',
          localized: true,
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
        },

        {
          name: 'paths',
          type: 'array',
          localized: true,
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'list',
              type: 'array',
              fields: [
                {
                  name: 'item',
                  type: 'text',
                },
                { name: 'icon', type: 'text' },
              ],
            },
            {
              name: 'link',
              type: 'text',
            },
          ],
        },
      ],
    },

    // -------------------------
    // Featured Products
    // -------------------------
    {
      name: 'featuredProducts',
      type: 'group',
      fields: [
        {
          name: 'sub_title',
          type: 'text',
          localized: true,
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
        },

        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'link1',
          type: 'text',
          localized: true,
        },
        {
          name: 'products',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
        },
        {
          name: 'link2',
          type: 'text',
          localized: true,
        },
      ],
    },

    // -------------------------
    // Trust Banner
    // -------------------------
    {
      name: 'trustBanner',
      type: 'group',
      fields: [
        {
          name: 'sub_title',
          type: 'text',
          localized: true,
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },

        {
          name: 'cards',
          type: 'array',
          localized: true,
          fields: [
            {
              name: 'sub_title',
              type: 'text',
            },
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'list',
              type: 'array',
              fields: [
                { name: 'item', type: 'text' },
                { name: 'icon', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
