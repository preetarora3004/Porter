export type Location = {
    name: string;
    longitude: number;
    latitude: number;
};

export async function geocode(
    query: string
): Promise<Location | null> {
    const token =
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
        throw new Error(
            "Mapbox token is missing"
        );
    }

    const url =
        `https://api.mapbox.com/search/geocode/v6/forward` +
        `?q=${encodeURIComponent(query)}` +
        `&country=in` +
        `&limit=1` +
        `&access_token=${token}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Failed to find location"
        );
    }

    const data = await response.json();

    const feature =
        data.features?.[0];

    if (!feature) {
        return null;
    }

    const [
        longitude,
        latitude,
    ] = feature.geometry.coordinates;

    return {
        name:
            feature.properties
                ?.full_address ?? query,

        longitude,
        latitude,
    };
}
