import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ['title', 'botanical_name', '_status'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'botanical_name_full',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    sku: true,
    botanical_name: true,
    gallery: true,
    meta: true,
    description: true,
    maintenance_level_garden_set: true,
    priceInEUR: true,
    common_name: true,
  },

  fields: [
    // Common / Title Field
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'product_type',
      type: 'select',
      required: true,
      defaultValue: 'plant',
      label: 'Product Type',
      options: [
        { label: 'Individual Plant', value: 'plant' },
        { label: 'Garden Set / Package', value: 'garden' },
      ],
      admin: {
        description:
          'Determines whether this product is a standalone plant or a bundled garden set.',
      },
    },
    {
      name: 'product_status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { width: '50%' },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'sku',
          type: 'text',
          required: true,
          label: 'Master SKU (e.g., SP-SALV-CARA-C2)',
          admin: { width: '50%' },
        },
      ],
    },

    {
      type: 'tabs',
      tabs: [
        // ==========================================
        // TAB 1: CONTENT & MEDIA
        // ==========================================
        {
          label: 'Content & Media',
          fields: [
            {
              name: 'common_name',
              type: 'text',
              required: true,
              localized: true,
              label: 'Common Name',
              admin: {
                description:
                  'Localized plant name mapping directly to Neighborbrite "names" field.',
                width: '50%',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: 'Description',
            },
            {
              name: 'gallery',
              type: 'array',
              minRows: 1,
              label: 'Plant Images',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
          ],
        },

        // ==========================================
        // TAB 2: BOTANICAL ATTRIBUTES (Neighborbrite API)
        // ==========================================
        {
          label: 'Botanical Attributes',
          // Show this tab content ONLY when product_type is 'plant'
          admin: {
            condition: (data) => data?.product_type === 'plant',
          },
          fields: [
            {
              type: 'row',

              fields: [
                {
                  name: 'category',
                  type: 'select',

                  options: [
                    { label: 'Perennials', value: 'perennials' },
                    { label: 'Grasses', value: 'grasses' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'botanical_name',
                  type: 'text',
                  required: true,
                  label: 'Botanical Name (e.g., Salvia nemorosa)',
                  admin: { width: '50%' },
                },
                {
                  name: 'cultivar',
                  type: 'text',
                  label: 'Cultivar (e.g., Caradonna)',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'botanical_name_full',
              type: 'text',
              label: "Full Botanical Name (e.g., Salvia nemorosa 'Caradonna')",
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'indoor_outdoor',
                  type: 'select',

                  label: 'Indoor / Outdoor',
                  options: [
                    { label: 'Outdoor', value: 'outdoor' },
                    { label: 'Indoor', value: 'indoor' },
                    { label: 'Both', value: 'both' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },

            // Group: Neighborbrite "attributes" Object
            {
              type: 'group',
              name: 'attributes',
              label: 'Plant Trait Attributes',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'hardiness_zone_min',
                      type: 'text',
                      label: 'Hardiness Zone Min',
                      admin: { width: '33%', placeholder: '5' },
                    },
                    {
                      name: 'foliage_type',
                      type: 'select',
                      options: [
                        { label: 'Deciduous', value: 'deciduous' },
                        { label: 'Evergreen', value: 'evergreen' },
                        { label: 'Semi-Evergreen', value: 'semi_evergreen' },
                      ],
                      admin: { width: '33%' },
                    },
                    {
                      name: 'water_requirements',
                      type: 'select',
                      options: [
                        { label: 'Low', value: 'low' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'High', value: 'high' },
                      ],
                      admin: { width: '33%' },
                    },
                  ],
                },

                // Height & Width Ranges
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'mature_height_min_cm',
                      type: 'number',
                      label: 'Mature Height Min (cm)',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'mature_height_max_cm',
                      type: 'number',
                      label: 'Mature Height Max (cm)',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'mature_width_min_cm',
                      type: 'number',
                      label: 'Mature Width Min (cm)',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'mature_width_max_cm',
                      type: 'number',
                      label: 'Mature Width Max (cm)',
                      admin: { width: '25%' },
                    },
                  ],
                },

                // Environmental & Biological Characteristics
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'sunlight',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Full Sun', value: 'full_sun' },
                        { label: 'Partial Sun', value: 'partial_sun' },
                        { label: 'Full Shade', value: 'shade' },
                      ],
                      admin: { width: '50%' },
                    },
                    {
                      name: 'bloom_season',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Spring', value: 'spring' },
                        { label: 'Summer', value: 'summer' },
                        { label: 'Fall', value: 'fall' },
                        { label: 'Winter', value: 'winter' },
                        { label: 'April', value: 'april' },
                        { label: 'May', value: 'may' },
                        { label: 'June', value: 'june' },
                        { label: 'July', value: 'july' },
                        { label: 'August', value: 'august' },
                        { label: 'September', value: 'september' },
                        { label: 'October', value: 'october' },
                      ],
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'flower_color',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Mixed', value: 'mixed' },
                        { label: 'Orange', value: 'orange' },
                        { label: 'Yellow', value: 'yellow' },
                        { label: 'Red', value: 'red' },
                        { label: 'Blue', value: 'blue' },
                        { label: 'Pink', value: 'pink' },
                        { label: 'Yellow-Green', value: 'yellow-green' },
                        { label: 'Magenta', value: 'magenta' },
                        { label: 'Violet', value: 'violet' },
                        { label: 'Lilac', value: 'lilac' },
                        { label: 'Purple', value: 'purple' },
                        { label: 'White', value: 'white' },
                        { label: 'Silver', value: 'silver' },
                        { label: 'Gold', value: 'gold' },
                        { label: 'Bronze', value: 'bronze' },
                        { label: 'Brown', value: 'brown' },
                        { label: 'Green', value: 'green' },
                      ],
                      admin: { width: '50%' },
                    },
                    {
                      name: 'pollinator_friendly',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Bees', value: 'bees' },
                        { label: 'Butterflies', value: 'butterflies' },
                        { label: 'Hummingbirds', value: 'hummingbirds' },
                      ],
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'pet_safe',
                      type: 'select',
                      defaultValue: 'unknown',
                      options: [
                        { label: 'Yes', value: 'safe' },
                        { label: 'No', value: 'toxic' },
                        { label: 'Unknown', value: 'unknown' },
                      ],
                      admin: { width: '33%' },
                    },
                    {
                      name: 'drought_tolerant',
                      type: 'checkbox',
                      label: 'Drought Tolerant',
                      defaultValue: false,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'deer_resistant',
                      type: 'checkbox',
                      label: 'Deer Resistant',
                      defaultValue: true,
                      admin: { width: '33%' },
                    },
                  ],
                },
              ],
            },

            // Group: External References
            {
              type: 'group',
              name: 'external_refs',
              label: 'External References',
              fields: [
                {
                  name: 'feed_item_id',
                  type: 'text',
                  label: 'Feed Item ID (e.g., SP-2201)',
                },
              ],
            },
          ],
        },

        // ==========================================
        // TAB 3: GARDEN SET DETAILS (Sets Only)
        // ==========================================

        {
          label: 'Garden Set Composition',
          // Show this tab content ONLY when product_type is 'garden'
          admin: {
            condition: (data) => data?.product_type === 'garden',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'maintenance_level_garden_set',
                  type: 'select',
                  options: [
                    { label: 'Low', value: 'low' },
                    { label: 'High', value: 'high' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'sunlight_garden_set',
                  type: 'select',
                  hasMany: true,
                  options: [
                    { label: 'Full Sun', value: 'full_sun' },
                    { label: 'Partial Sun', value: 'partial_sun' },
                    { label: 'Full Shade', value: 'shade' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'set_items',
              type: 'array',
              label: 'Included Plants in Set',
              minRows: 1,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'plant',
                      type: 'relationship',
                      relationTo: 'products',
                      required: true,
                      label: 'Select Plant',
                      // Restrict picker to show only individual plants
                      filterOptions: {
                        product_type: { equals: 'plant' },
                      },
                      // admin: { width: '70%' },
                    },
                    {
                      name: 'density_per_sqm',
                      type: 'number',
                      required: true,
                      label: 'Plant Density (per m²)',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'style_tags',
              type: 'select',
              hasMany: true,

              options: [
                { label: 'Hot & Rocky', value: 'hot-rocky' },
                { label: 'Mediterranean & Fragrant', value: 'mediterranean-fragrant' },
                { label: 'Romantic & Delicate', value: 'romantic-delicate' },
                { label: 'Elegant & Bright', value: 'elegant-bright' },
                { label: 'Elegant & Dark', value: 'elegant-dark' },
                { label: 'Green & Easy-Care', value: 'green-easy' },
                { label: 'Fiery & Lively', value: 'fiery-lively' },
                { label: 'Wild & Tall', value: 'wild-tall' },
                { label: 'Bright & Warm', value: 'bright-warm' },
                { label: 'Romantic & Shaded', value: 'romantic-shaded' },
                { label: 'Bold & Elegant', value: 'bold-elegant' },
                { label: 'Natural & Woodland', value: 'natural-woodland' },
              ],
              admin: { width: '50%' },
            },
          ],
        },

        // ==========================================
        // TAB 3: E-COMMERCE & INTEGRATION
        // ==========================================
        {
          label: 'E-Commerce Details',
          fields: [
            ...defaultCollection.fields,
            {
              name: 'sync_to_neighborbrite',
              type: 'checkbox',
              label: 'Expose to Neighborbrite API Feed',
              defaultValue: true,
            },
            {
              name: 'pot_size',
              type: 'select',
              label: 'Pot Size',
              options: [
                { label: '9 cm Bio', value: 'P 0,5 Bio' },
                { label: '9 cm', value: 'P 0,5' },
                { label: '10 cm', value: 'T 10' },
                { label: '14 cm', value: 'T 14' },
              ],
              admin: {
                condition: (data) => data?.product_type === 'plant',
              },
            },
            {
              name: 'product_url',
              type: 'text',
              label: 'Product URL',
            },
            {
              name: 'purchase_url',
              type: 'text',
              label: 'Purchase URL',
            },
            {
              name: 'relatedProducts',
              type: 'relationship',
              hasMany: true,
              relationTo: 'products',
              filterOptions: ({ id }) => (id ? { id: { not_in: [id] } } : { id: { exists: true } }),
            },
          ],
        },

        // ==========================================
        // TAB 4: SEO METADATA
        // ==========================================
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },

    // Sidebar Attributes
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    slugField(),
  ],
})
