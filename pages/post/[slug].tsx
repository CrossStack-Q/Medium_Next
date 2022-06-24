import { GetStaticProps } from 'next'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import Image from 'next/image'

import { useForm, SubmitHandler } from 'react-hook-form'
// import PortableText from 'react-portable-text'
import { PortableText } from '@portabletext/react'
import { Post } from '../../typing'
interface Props {
  post: Post
}

interface IFormInput {
  _id: string;
  name: string;
  email:string;
  comment:string;
}

function Post({ post }: Props) {




  const {register,handleSubmit,formState:{errors}} = useForm<IFormInput >(); 

   const onSubmit: SubmitHandler<IFormInput> = (data)  => {
     fetch('api/createComment',{
      method: 'Post',
      body: JSON.stringify(data),
   }).then(() =>{
    console.log(data);
    
   })
   
  }
 










  function createMarkup(c) {
    return { __html: c }
  }
  const ptComponents = {
    types: {
      image: ({ value }) => {
        if (!value?.asset?._ref) {
          return null
        }
        return (
          <img
            alt={value.alt || ' '}
            loading="lazy"
            src={urlFor(value)
              .width(1640)
              .height(1000)
              .fit('max')
              .auto('format')}
          />
        )
      },
      h1: ({ value }) => {
        if (!value?.asset?._ref) {
          return null
        }
        return <h1>{value}</h1>
      },
    },
  }

  const { title = 'Missing title', body = [] } = post
  return (
    <main>
      <Header />
      <img
        className="w-full h-40 object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="max-w-4xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>

        <h2 className="text-xl font-light text-gray-500 mb-2">
          {post.description}
        </h2>
        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()}
            alt=""
          />
          <p className="font-extralight text-sm ml-3">
            Blog post by {post.author.name} -Published at{' '}
            {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div dangerouslySetInnerHTML={createMarkup(post.description)}></div>
        <div className="mt-10">
          {/* <PortableText
            dataset="process.env.NEXT_PUBLIC_SANITY_DATASET"
            className=""
            serializers={{
              h1: (props: any) => {
                ;<h1 className="text-2xl font-bold my-5" {...props} />
              },
              h2: (props: any) => {
                ;<h2 className="text-2xl font-bold my-5" {...props} />
              },
              main: (props: any) => {
                ;<main className="text-2xl font-bold my-5" {...props} />
              },
              img: (props: any) => {
                ;<img src="" alt="" />
              },

              li: ({ children }: any) => {
                ;<li className="ml-4 list-disc" {...children} />
              },
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
            content={post.body}
            projectId="process.env.NEXT_PUBLIC_SANITY_PROJECT_ID"
          /> */}

          <PortableText value={body} components={ptComponents} />
        </div>
      </article>

      <form onSubmit={handleSubmit(onSubmit)} action="" className='flex flex-col p-5 mb-10 mx-auto max-w-2xl'>
        <h3 className='text-sm text-yellow-500'>Enjoyed thhis article?</h3>
        <h4 className='text-3xl font-bold'>Leave a comment</h4>
        <hr className='py-3 mt-2' />



        <input 
        {...register("_id")}
        type="hidden"
        name="_id"
        value={post._id} />



        <label className='block mb-5'>
          <span className='text-gray-700'> Name</span>
          <input {...register("name",{required: true})} className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring' type="text" name="" id="" placeholder="Cross Rehk" />
        </label>
        <label className='block mb-5'>
          <span className='text-gray-700'> Email</span>
          <input {...register("email",{required: true})} className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring' type="email" name="" id="" placeholder="@mail" />
        </label>
        <label className='block mb-5'>
          <span className='text-gray-700'> Commment</span>
          <textarea {...register("comment",{required: true})} className='shadow border rounded py-2 px-3 form-textarea mt-1 block  w-full ring-yellow-500 outline-none focus:ring' rows={8} name="" id="" placeholder="Cross Rehk" />
        </label>


        {/* error */}
        <div className='flex flex-col p-5 '>
          {errors.name && (<span className='text-red-400'>
            The name field is  required
          </span>)}
          {errors.email && (<span className='text-red-400'>   
            The email field is  required
          </span>)}
          {errors.comment && (<span className='text-red-400'>
            The comment field is  required
          </span>)}
        </div>

        <input type="submit" className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline  focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer' />
       
      </form>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type =="post"]{
        _id,
        slug {
            current
        }
      }`

  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type =="post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        slug,description,
        mainImage,
        author-> {
        name,
        image
      },
      mainImage,
      body
      }`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60, //regenerate after 60 seconds
  }
}
