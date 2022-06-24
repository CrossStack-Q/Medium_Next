import {
    // createImageUrlBuilder,
    createCurrentUserHook,
    createClient
} from "next-sanity";
import {PortableText} from '@portabletext/react'

import createImageUrlBuilder from '@sanity/image-url'

export const  config =  {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    apiVersions: "2021-03-25",






    useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(config);


 

export const urlFor = (source) => createImageUrlBuilder(config).image(source);

export const useCurrentUser = createCurrentUserHook(config);