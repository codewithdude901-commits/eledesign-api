export async function deleteAddress(addressID: string) {
  const response = await fetch(`/api/addresses/${addressID}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()

    throw new Error(errorText || 'Failed to delete address')
  }

  return true
}
