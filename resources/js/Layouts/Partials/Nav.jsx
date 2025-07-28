import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
function Nav({ user, sidebarOpen, setSidebarOpen }) {
  return (
    <div>
      <nav className="bg-white border-b border-primary-light/30 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center justify-start">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer md:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                inert="true"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <svg
                inert="true"
                className="hidden w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Toggle sidebar</span>
            </button>
            <a href="/">
              <ApplicationLogo className="flex w-auto h-10 text-gray-800 fill-current dark:text-gray-200" />
            </a>
          </div>
          <div className="flex items-center mr-5 lg:order-2">
            <div className="relative ms-1">
              <Dropdown>
                <Dropdown.Trigger>
                  <span className="inline-flex rounded-md">
                    <button
                      type="button"
                      className="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                    >
                      <span className="sr-only">Open user menu</span>
                      {user?.avatar ? (
                        <img
                          className="w-8 h-8 rounded-full"
                          alt="user-avatar"
                          src={"storage/" + user?.avatar}
                        />
                      ) : (
                        <img
                          className="w-8 h-8 rounded-full"
                          src="./../assets/img/user.webp"
                          alt="user photo"
                        />
                      )}
                    </button>
                  </span>
                </Dropdown.Trigger>

                <Dropdown.Content>
                  <div className="px-4 py-3">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </span>
                    <span className="block text-sm text-gray-900 truncate dark:text-white">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 px-4 py-3">
                    <a href="dashboard" className="align-middle">
                      Perfil
                    </a>
                    <a
                      href="logout"
                      className="align-middle"
                      method="post"
                      as="button"
                    >
                      Cerrar Sesión
                    </a>
                  </div>
                </Dropdown.Content>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Nav;
