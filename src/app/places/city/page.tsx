"use client"

import { searchNearbyWithinCity } from "@/actions/geoapify"
import Loading from "@/components/loading"
import Places from "@/components/places"
import { selectedPlaceIdAtom } from "@/stores/selected-location"
import { useAtomValue } from "jotai"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function PlacesInCity() {
  const searchParams = useSearchParams()
  const categories = searchParams.get("categories")
  const place_id = useAtomValue(selectedPlaceIdAtom)
  const router = useRouter()
  const [places, setPlaces] = useState<any>()
  const [isLoading, setIsLoading] = useState(true)

  if (!place_id || !categories) {
    router.push("/")
    return
  }

  useEffect(() => {
    searchNearbyWithinCity(place_id, categories).then((data) => {
      setIsLoading(false)
      setPlaces(data)
    })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {isLoading && <Loading />}
      {places && <Places places={places} />}
    </div>
  )
}
