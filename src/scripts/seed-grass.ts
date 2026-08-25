/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import { grassProducts } from '@/data/grass'

async function seedGrass() {
  const config = await configPromise
  const payload = await getPayload({ config })

  console.log(`Starting import of ${grassProducts.length} grass products...`)

  for (const product of grassProducts) {
    try {
      let mediaId: string | number | undefined = undefined

      // 1. Resolve and upload local image to R2 via Payload Media collection
      if (product.image) {
        const relativeImagePath = product.image.startsWith('/')
          ? product.image.slice(1)
          : product.image

        const absoluteImagePath = path.resolve(process.cwd(), 'public', relativeImagePath)

        if (fs.existsSync(absoluteImagePath)) {
          const fileName = path.basename(absoluteImagePath)
          const fileBuffer = fs.readFileSync(absoluteImagePath)
          const fileSize = fs.statSync(absoluteImagePath).size

          const mediaDoc = await payload.create({
            collection: 'media',

            data: {
              alt: product.common_name.en,
            },

            file: {
              data: fileBuffer,
              name: fileName,
              mimetype: getMimeType(fileName),
              size: fileSize,
            },
          })

          mediaId = mediaDoc.id

          console.log(`Uploaded image for ${product.common_name.en} -> ID: ${mediaId}`)
        } else {
          console.warn(
            `File not found at ${absoluteImagePath}. Skipping image upload for ${product.common_name.en}.`,
          )
        }
      }

      // 2. Prepare product data
      const productData: Record<string, any> = {
        sku: product.sku,

        title: product.botanical_name,
        slug: createSlug(product.botanical_name_full),

        // Localized fields
        common_name: product.common_name.de,
        description: product.description.de,

        // Basic product information
        status: product.status,
        category: product.category,
        indoor_outdoor: product.indoor_outdoor,

        // Botanical information
        botanical_name: product.botanical_name,
        cultivar: product.cultivar,
        botanical_name_full: product.botanical_name_full,

        // Plant attributes
        attributes: {
          hardiness_zone_min: product.attributes.hardiness_zone_min,

          sunlight: product.attributes.sunlight,

          mature_height_min_cm: product.attributes.mature_height_min_cm,

          mature_height_max_cm: product.attributes.mature_height_max_cm,

          mature_width_min_cm: product.attributes.mature_width_min_cm,

          mature_width_max_cm: product.attributes.mature_width_max_cm,

          foliage_type: product.attributes.foliage_type,

          bloom_season: product.attributes.bloom_season,

          flower_color: product.attributes.flower_color,

          water_requirements: product.attributes.water_requirements,

          drought_tolerant: product.attributes.drought_tolerant,

          deer_resistant: product.attributes.deer_resistant,

          pollinator_friendly: product.attributes.pollinator_friendly,

          pet_safe: product.attributes.pet_safe,
        },
      }

      // 3. Add uploaded media to gallery
      if (mediaId) {
        productData.gallery = [
          {
            image: mediaId,
          },
        ]
      }

      // 4. Create Product record
      const createdProduct = await payload.create({
        collection: 'products',
        locale: 'de',
        data: productData as any,
      })

      await payload.update({
        collection: 'products',
        id: createdProduct.id,
        locale: 'en',
        data: {
          common_name: product.common_name.en,
          description: product.description.en,
        },
      })

      console.log(`Imported: ${createdProduct.botanical_name ?? product.common_name.en}`)
    } catch (err) {
      console.error(`Error importing ${product.common_name.en}:`, err)
    }
  }

  console.log('Grass seeding finished successfully!')

  process.exit(0)
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()

  if (ext === '.jpg' || ext === '.jpeg') {
    return 'image/jpeg'
  }

  if (ext === '.png') {
    return 'image/png'
  }

  if (ext === '.webp') {
    return 'image/webp'
  }

  return 'application/octet-stream'
}

function createSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

seedGrass()
