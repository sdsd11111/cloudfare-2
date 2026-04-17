function getBunnyConfig() {
  return {
    zone: process.env.BUNNY_STORAGE_ZONE || '',
    apiKey: process.env.BUNNY_STORAGE_API_KEY || '',
    host: process.env.BUNNY_STORAGE_HOST || '',
    pullZone: process.env.BUNNY_PULLZONE_URL || '',
  }
}

export async function uploadToBunny(
  file: Buffer,
  filename: string,
  folder: string = 'aquatech-crm'
): Promise<string> {
  const { zone, apiKey, host, pullZone } = getBunnyConfig()
  const timestamp = Date.now()
  const path = `/${zone}/${folder}/${timestamp}-${filename}`
  
  const response = await fetch(`https://${host}${path}`, {
    method: 'PUT',
    headers: {
      AccessKey: apiKey,
      'Content-Type': 'application/octet-stream',
    },
    body: file as any,
  })

  if (!response.ok) {
    throw new Error(`Bunny upload failed: ${response.statusText}`)
  }

  return `${pullZone}/${folder}/${timestamp}-${filename}`
}

export async function deleteFromBunny(fileUrl: string): Promise<void> {
  const { zone, apiKey, host, pullZone } = getBunnyConfig()
  const urlPath = fileUrl.replace(pullZone, '')
  const path = `/${zone}${urlPath}`
  
  await fetch(`https://${host}${path}`, {
    method: 'DELETE',
    headers: {
      AccessKey: apiKey,
    },
  })
}
