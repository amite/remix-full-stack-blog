import { Link, useLoaderData, useMatches } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getPostListings } from "~/models/post.server";
import { useOptionalAdminUser } from "~/utils";

export type LoaderData = {
  posts: Awaited<ReturnType<typeof getPostListings>>;
};

export const loader: LoaderFunction = async () => {
  const posts = await getPostListings();

  return json<LoaderData>({ posts });
};

export default function PostsRoute() {
  const { posts } = useLoaderData() as LoaderData;
  const adminUser = useOptionalAdminUser();

  // console.log("matches", matches);

  return (
    <main>
      <h1 className="text-lg">Posts</h1>
      {adminUser ? (
        <Link to="admin" className="text-blue-600 underline">
          Admin
        </Link>
      ) : null}
      <ul>
        {posts.map((post) => {
          return (
            <li key={post.slug}>
              <Link prefetch="intent" to={post.slug} className="link-hover">
                {post.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
