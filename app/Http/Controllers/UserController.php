<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Apply;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Assignment;
use Illuminate\Support\Arr;
use App\Models\Announcement;
use Illuminate\Http\Request;
use App\Models\AssignmentUser;
use PhpParser\Node\Expr\Assign;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use RealRashid\SweetAlert\Facades\Alert;

class UserController extends Controller
{

    public function index(Request $request)
    {
        $users = User::orderBy('created_at', 'DESC')->get();
        $roles = Role::pluck('name')->all();
        return view('admin.users.index', compact('users', 'roles'));
    }

    public function create()
    {
        $roles = Role::pluck('name', 'id')->all();
        return view('admin.users.create', compact('roles'));
    }


    public function store(Request $request)
    {

        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|same:confirm-password',
            'rut' => 'required',
            'role' => 'required',
            'birthday' => 'required'
        ]);

        $input = $request->all();
        $input['password'] = Hash::make($input['password']);
        $input['state'] = 1;
        $user = User::create($input);


        if ($request->role == 2) {
            $paciente = Patient::create([
                'user_id' => $user->id,
                'state' => 1,
                'orden' => 0
            ]);
        } elseif ($request->role == 3) {
            $doctor = Doctor::create([
                'user_id' => $user->id,
                'profesion' => 'Kinesiologo',
                'firma' => null,
                'state' => 1
            ]);
        }

        $success = $user->assignRole($request->input('role'));

        if ($success) {

            toast('¡Usuario agregrado correctamente!', 'success');
        } else {

            toast('Ha ocurrido un problema, inténtelo nuevamente', 'danger');
        }

        return redirect()->route('users.index');
    }


    public function show($id)
    {
        $user = User::find($id);
        $roles = Role::pluck('name', 'name')->all();
        $userRole = $user->roles->pluck('name', 'name')->all();

        return view('admin.users.show', compact('user', 'roles', 'userRole'));
    }


    public function edit($id)
    {
        $user = User::find($id);
        $roles = Role::pluck('name', 'name')->all();
        $userRole = $user->roles->pluck('name', 'name')->all();

        return view('admin.users.edit', compact('user', 'roles', 'userRole'));
    }


    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:users,email,' . $id,
            /* 'password' => 'same:confirm-password', */
            'roles' => 'required'
        ]);

        $input = $request->all();
        if (!empty($input['confirm-password'])) {
            $input['password'] = Hash::make($input['confirm-password']);
        } else {
            $input = Arr::except($input, array('password'));
        }

        $user = User::find($id);
        $user->update($input);
        DB::table('model_has_roles')->where('model_id', $id)->delete();

        $success = $user->assignRole($request->input('roles'));

        if ($success) {
            toast('¡Usuario actualizado correctamente!', 'success');
        } else {
            toast('Ha ocurrido un problema, inténtelo nuevamente', 'danger');
        }

        return redirect()->route('users.index');
    }


    public function destroy(User $user)
    {
        $mensaje =  $user->delete();
        if ($mensaje) {
            toast('Usuario eliminado', 'success');
        } else {
            toast('Usuario no eliminado', 'warning');
        }
        return redirect()->route('users.index');
    }
}
