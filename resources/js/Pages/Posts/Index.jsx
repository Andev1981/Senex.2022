import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Can from "@/components/Can";
import { usePermission } from "@/Hooks/usePermission";

export default function Index({ posts }) {
  const { hasPermission, hasRole } = usePermission();

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Posts
          </h2>

          <Can permission="posts.create">
            <Link
              href={route("posts.create")}
              className="px-4 py-2 text-white bg-blue-500 rounded"
            >
              Crear Post
            </Link>
          </Can>
        </div>
      }
    >
      <Head title="Posts" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
              {posts.map((post) => (
                <div key={post.id} className="p-4 mb-4 border rounded">
                  <h3 className="text-lg font-bold">{post.title}</h3>
                  <p className="text-gray-600">{post.content}</p>

                  <div className="flex gap-2 mt-2">
                    <Can permission="posts.edit">
                      <Link
                        href={route("posts.edit", post.id)}
                        className="text-blue-500 hover:underline"
                      >
                        Editar
                      </Link>
                    </Can>

                    <Can permission="posts.delete">
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    </Can>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
