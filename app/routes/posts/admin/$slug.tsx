import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";
import invariant from "tiny-invariant";
import { requireAdminUser } from "~/session.server";

import type { Post } from "~/models/post.server";

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

type LoaderData = {
  post?: Post;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  if (params.slug === "new") return json({});
  invariant(params.slug, "slug must exist");

  const post = await getPost(params.slug);

  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({
    post,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  const formData = await request.formData();

  const intent = formData.get("intent");

  if (intent === "delete") {
    invariant(params.slug, "slug must be defined");
    await deletePost(params.slug);
    return redirect("posts/admin");
  }

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  if (params.slug === "new") {
    await createPost({ title, slug, markdown });
  } else {
    // update post
    // invariant(slug, "slug must be defined");
    invariant(params.slug, "slug must be defined");
    await updatePost(params.slug, { title, slug, markdown });
  }

  return redirect("/posts/admin");
};

export default function NewPost() {
  const errors = useActionData() as ActionData;
  const data = useLoaderData() as LoaderData;
  const transition = useTransition();

  const isUpdating =
    transition?.submission?.formData.get("intent") === "update";
  const isCreating =
    transition?.submission?.formData.get("intent") === "create";
  const isNewPost = !data.post;

  const isDeleting =
    transition?.submission?.formData.get("intent") === "delete";

  return (
    <Form method="post" key={data.post?.slug ?? "new"}>
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            className={inputClassName}
            defaultValue={data.post?.title}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            className={inputClassName}
            defaultValue={data.post?.slug}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>
        <br />
        {errors?.markdown ? (
          <em className="text-red-600">{errors.markdown}</em>
        ) : null}
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
          defaultValue={data.post?.markdown}
        />
      </p>
      <div className="flex justify-end gap-4">
        {isNewPost ? null : (
          <button
            className="btn btn-warning"
            type="submit"
            name="intent"
            value="delete"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting Post" : "Delete Post"}
          </button>
        )}
        <button
          type="submit"
          name="intent"
          value={isNewPost ? "create" : "update"}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating || isUpdating}
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create Post") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update Post"}
        </button>
      </div>
    </Form>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <div className="text-red-500">
        Uh oh! The post with the slug "{params.slug}" does not exist!
      </div>
    );
  }
  throw new Error(`Unsupported thrown response status code: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: unknown }) {
  if (error instanceof Error) {
    return (
      <div className="text-red-500">
        Oh no, something went wrong!
        <pre>{error.message}</pre>
      </div>
    );
  }
  return <div className="text-red-500">Oh no, something went wrong!</div>;
}
