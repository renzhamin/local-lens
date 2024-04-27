"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cohereCall, getLocationsForOneDay } from "@/actions/tour-plan"
import { searchNearby } from "@/actions/geoapify"
import { getWeather } from "@/actions/weather"
import { useState } from "react"

const formSchema = z.object({
  placeId: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  tourNature: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  travelMode: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  lat: z.coerce
    .number()
    .max(90, { message: "latitude must be between 90 and -90" })
    .min(-90, { message: "latitude must be between 90 and -90" }),
  lon: z.coerce
    .number()
    .max(180, { message: "longitude must be between 180 and -180" })
    .min(-180, { message: "longitude must be between 180 and -180" }),
})

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placeId: "",
      tourNature: "",
      travelMode: "",
    },
  })

  const [planMessage, setPlanMessage] = useState<string>("")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const accommodation =
      values.tourNature === "family"
        ? "accommodation.hotel,accommodation.hut,accommodation.chalet,accommodation.apartment,accommodation.guest_house"
        : "accommodation.hotel,accommodation.motel"

    // get accommodation
    const accommodation_location = await searchNearby(
      values.placeId,
      values.lat,
      values.lon,
      accommodation,
      100,
    )

    const random_accommodation =
      accommodation_location[
        Math.floor(Math.random() * accommodation_location.length)
      ]

    // get locations for one day
    var visited = new Set<string>()
    const locations1 = await getLocationsForOneDay(
      random_accommodation.lat,
      random_accommodation.lon,
      values.tourNature,
      values.travelMode,
      visited,
    )

    visited.add(locations1.attraction1.place_id)
    visited.add(locations1.attraction2.place_id)

    // get locations for second day
    const locations2 = await getLocationsForOneDay(
      random_accommodation.lat,
      random_accommodation.lon,
      values.tourNature,
      values.travelMode,
      visited,
    )

    visited.add(locations2.attraction1.place_id)
    visited.add(locations2.attraction2.place_id)

    // get locations for third day
    const locations3 = await getLocationsForOneDay(
      random_accommodation.lat,
      random_accommodation.lon,
      values.tourNature,
      values.travelMode,
      visited,
    )
    visited.add(locations3.attraction1.place_id)
    visited.add(locations3.attraction2.place_id)

    // get weather forecast
    // const weatherForecast = await getWeather(values.lat, values.lon)

    const results = {
      locations: {
        accommodation: random_accommodation,
        day1: locations1,
        day2: locations2,
        day3: locations3,
      },
      // weather_forcast: {
      //   day1: {
      //     max_temp: weatherForecast.forecast.forecastday[0].day.maxtemp_c,
      //     min_temp: weatherForecast.forecast.forecastday[0].day.mintemp_c,
      //     chance_of_rain:
      //       weatherForecast.forecast.forecastday[0].day.daily_chance_of_rain,
      //     aqi:
      //       weatherForecast.forecast.forecastday[0].day.air_quality.pm2_5 * 10,
      //   },
      //   day2: {
      //     max_temp: weatherForecast.forecast.forecastday[1].day.maxtemp_c,
      //     min_temp: weatherForecast.forecast.forecastday[1].day.mintemp_c,
      //     chance_of_rain:
      //       weatherForecast.forecast.forecastday[1].day.daily_chance_of_rain,
      //     aqi:
      //       weatherForecast.forecast.forecastday[1].day.air_quality.pm2_5 * 10,
      //   },
      //   day3: {
      //     max_temp: weatherForecast.forecast.forecastday[2].day.maxtemp_c,
      //     min_temp: weatherForecast.forecast.forecastday[2].day.mintemp_c,
      //     chance_of_rain:
      //       weatherForecast.forecast.forecastday[2].day.daily_chance_of_rain,
      //     aqi:
      //       weatherForecast.forecast.forecastday[2].day.air_quality.pm2_5 * 10,
      //   },
      // },
    }

    cohereCall(results)
      .then((data) => {
        setPlanMessage(data)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="placeId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Place ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tourNature"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Tour Nature</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="travelMode"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Travel Mode</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lon"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>

      <div className="text-center">{planMessage}</div>
    </div>
  )
}
