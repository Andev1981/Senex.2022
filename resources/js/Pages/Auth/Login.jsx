import ApplicationLogo from "@/Components/ApplicationLogo";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Lock, Mail } from "lucide-react";

export default function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();

    post(route("login"), {
      onFinish: () => reset("password"),
    });
  };

  return (
    <GuestLayout>
      <Head title="Inicio de Sesión" />

      <div className="items-center justify-center w-full">
        <div className="text-center">
          <div className="flex items-center justify-center p-3 mx-auto rounded-full shadow-lg w-36 h-36">
            {/*  <HardHat className="w-8 h-8 text-gray-900" /> */}
            <Link href="/">
              <ApplicationLogo className="w-20 text-gray-500 fill-current" />
            </Link>
          </div>

          {/*                     <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Senex App
                    </h2> */}
          <p className="mt-2 text-sm text-gray-600">Acceder a senex app</p>
        </div>
      </div>
      <hr className="pb-2" />
      <form onSubmit={submit}>
        <div className="mt-1">
          <InputLabel htmlFor="email" value="Email" />

          <div className="relative">
            <TextInput
              id="email"
              type="email"
              name="email"
              value={data.email}
              className="relative block w-full px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-light focus:z-10 sm:text-sm bg-white/80"
              autoComplete="username"
              isFocused={true}
              onChange={(e) => setData("email", e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <InputError message={errors.email} className="mt-2" />
          </div>
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password" value="Password" />
          <div className="relative">
            <TextInput
              id="password"
              type="password"
              name="password"
              value={data.password}
              className="relative block w-full px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-light focus:z-10 sm:text-sm bg-white/80"
              autoComplete="current-password"
              onChange={(e) => setData("password", e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="w-5 h-5 text-gray-600" />
            </div>
            <InputError message={errors.password} className="mt-2" />
          </div>
        </div>

        <div className="block mt-4">
          <label className="flex items-center">
            <Checkbox
              name="remember"
              checked={data.remember}
              onChange={(e) => setData("remember", e.target.checked)}
            />
            <span className="text-sm text-gray-600 ms-2 dark:text-gray-400">
              Recordar
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end mt-4">
          {/*  {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-sm text-gray-600 underline rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                            >
                                Olvide mi Contraseña
                            </Link>
                        )} */}

          <PrimaryButton className="ms-4" disabled={processing}>
            Iniciar Sesión
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}
