<?php

namespace App\Http\Livewire;

use App\Models\Attention;
use App\Models\Doctor;
use App\Models\Image;
use App\Models\Patient;
use App\Models\QuizzAnswer;
use App\Models\QuizzQuestion;
use App\Models\Schedule;
use App\Models\Solicitud;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use Illuminate\Support\Str;
use Livewire\WithFileUploads;
use Illuminate\Support\Facades\Session;

use function PHPUnit\Framework\isNull;

class Steps extends Component
{

    use WithFileUploads;

    public $currentPage = 1;
    public $first;
    public $firstErr = false;
    public $dateErr = false;
    public $sexoErr = false;
    public $embarazoErr = false;
    public $pesoErr = false;
    public $firstEnable = true;
    public $birthday = '';
    public $sexo = '';
    public $peso;
    public $mensajePrimero = '';

    /* Variables pagina 3 */
    public $patologias = [];
    public $otraPatologia = '';
    public $otraPatologiaVisible = 0;
    public $selector = 0;
    public $hipertension  = false;
    public $diabetes = false;
    public $hipotiroidismo = false;
    public $ningunaPatologia = false;
    public $mensaje = "";

    /* Variables pagina 4 */
    public $cirugias = '';
    public $cirugiasVisible = 0;
    public $mensajeCirugia = '';
    public $cirugiaSi = '';

    /* Variables pagina 5 */
    public $alergias = '';
    public $alergiasVisible = 0;
    public $mensajeAlergia = '';
    public $alergiaSi = '';

     /* Variables pagina 6 */
     public $medicamentos = '';
     public $medicamentosVisible = 0;
     public $mensajeMedicamento = '';
     public $medicamentoSi = '';

      /* Variables pagina 7 */
    public $anticonceptivos = '';
    public $anticonceptivosVisible = 0;
    public $mensajeAnticonceptivo = '';
    public $anticonceptivoSi = '';

    /* Variables pagina 8 */
    public $embarazo = '';
    public $embarazoVisible = 0;
    public $mensajeEmbarazo = '';
    public $embarazoSi = '';

    /* Variables pagina 9 */
    public $amamanta = '';
    public $amamantaVisible = 0;
    public $mensajeAmamanta = '';
    public $amamantaSi = '';

    /* Variables pagina 10 */
    public $algoMas = '';
    public $mensajeMotivo='';

    public $files = [];
    public $images = [];
    public $imagenes = 0;
    public $maximoImagenes = '';
    public $photo;

    public $img1;
    public $img2;
    public $img3;
    public $img4;
    public $img5;
    public $errorImg;

    public $docs = [];

    public $doctors = [];
    public $doctorName;
    public $doctorProfesion;
    public $control;
    public $doc;
    public $agendas;
    public $agendaSelect;

    public $selectModal;

    public $paciente;

    public function openModal($openModal){

        $this->doc = Doctor::find($openModal);
        $this->doctorName = $this->doc->user->name;
        $this->doctorProfesion = $this->doc->profesion;

        $this->selectModal = true;

    }

    public function closeModal(){
        $this->selectModal = '';
        $this->doc = '';
        $this->doctorName = '';
        $this->doctorProfesion = '';
    }

    public function save(){

        

        $user = auth()->user()->name;
        $atencion = Session::get('attention_id');
        if($this->img1){
            $nombre =  time() . '.'.$this->img1->getClientOriginalExtension();
            $this->img1->storeAs('img/consultas/'.$user.'/'.$atencion, $nombre);
            $file_save = new Image();
            $file_save->name = 'img/consultas/'.$user.'/'.$atencion.'/'.$nombre;
            $file_save->user_id = auth()->user()->id;
            $file_save->type = 1;
            $file_save->solicitud_id = $atencion;
            $file_save->save();
        }

        if($this->img2){
            $nombre =  time() . '.'.$this->img2->getClientOriginalExtension();
            $this->img2->storeAs('img/consultas/'.$user.'/'.$atencion, $nombre);
            $file_save = new Image();
            $file_save->name = 'img/consultas/'.$user.'/'.$atencion.'/'.$nombre;
            $file_save->user_id = auth()->user()->id;
            $file_save->type = 1;
            $file_save->solicitud_id = $atencion;
            $file_save->save();
        }

        if($this->img3){
            $nombre =  time() . '.'.$this->img3->getClientOriginalExtension();
            $this->img3->storeAs('img/consultas/'.$user.'/'.$atencion, $nombre);
            $file_save = new Image();
            $file_save->name = 'img/consultas/'.$user.'/'.$atencion.'/'.$nombre;
            $file_save->user_id = auth()->user()->id;
            $file_save->type = 1;
            $file_save->solicitud_id = $atencion;
            $file_save->save();
        }

        if($this->img4){
            $this->validate([
                'img4' => 'image|max:1024',
            ]);
            $nombre =  time() . '.'.$this->img4->getClientOriginalExtension();
            $this->img4->storeAs('img/consultas/'.$user.'/'.$atencion, $nombre);
            $file_save = new Image();
            $file_save->name = 'img/consultas/'.$user.'/'.$atencion.'/'.$nombre;
            $file_save->user_id = auth()->user()->id;
            $file_save->type = 1;
            $file_save->solicitud_id = $atencion;
            $file_save->save();
        }

        if($this->img5){
            $this->validate([
                'img5' => 'image|max:1024',
            ]);
            $nombre =  time() . '.'.$this->img5->getClientOriginalExtension();
            $this->img5->storeAs('img/consultas/'.$user.'/'.$atencion, $nombre);
            $file_save = new Image();
            $file_save->name = 'img/consultas/'.$user.'/'.$atencion.'/'.$nombre;
            $file_save->user_id = auth()->user()->id;
            $file_save->type = 1;
            $file_save->solicitud_id = $atencion;
            $file_save->save();
        }

          $this->currentPage ++;
           $this->pages[3]['porcentaje'] = 100;
           $this->pages[4]['porcentaje'] = 50;
           $this->pages[4]['bgColor'] = 'bg-green-500';
           $this->pages[4]['txtColor'] = 'text-white';

    }

    public function saveDocs(){

        $this->validate([
            'docs.*' => 'mimes:jpg,jpeg,png,bmp,gif,svg,webp,pdf,docx|max:1024', // 1MB Max
        ]);

        $user = auth()->user()->name;
        $atencion = Session::get('attention_id');

        foreach ($this->docs as $doc) {
            $nombre =  time() . '.'.$doc->getClientOriginalExtension();
            $doc->storeAs('docs/consultas/'.$user.'/'.$atencion, $nombre);
            $file_save = new Image();
            $file_save->name = 'docs/consultas/'.$user.'/'.$atencion.'/'.$nombre;
            $file_save->user_id = auth()->user()->id;
            $file_save->type = 3;
            $file_save->solicitud_id = $atencion;
            $file_save->save();
        }


            //Indíquenos su sexo
            QuizzAnswer::create([
                'answer' => $this->mensajePrimero,
                'solicitud_id' =>  $atencion,
                'quizz_question_id' => 1
            ]);
            

            //Cirugía
            if($this->cirugias == "SI"){
                QuizzAnswer::create([
                    'answer' => $this->cirugiaSi,
                    'solicitud_id' =>  $atencion,
                    'quizz_question_id' => 4
                ]);
            }else{
                QuizzAnswer::create([
                    'answer' => "NO",
                    'solicitud_id' =>  $atencion,
                    'quizz_question_id' => 4
                ]);
            }

            //Alergias
            if($this->alergias == "SI"){
                QuizzAnswer::create([
                    'answer' => $this->alergiaSi,
                    'solicitud_id' =>  $atencion,
                    'quizz_question_id' => 5
                ]);
            }else{
                QuizzAnswer::create([
                    'answer' => "NO",
                    'solicitud_id' =>  $atencion,
                    'quizz_question_id' => 5
                ]);
            }



            //Medicamentos
            if($this->medicamentos == "SI"){
                QuizzAnswer::create([
                    'answer' => $this->medicamentoSi,
                    'solicitud_id' =>  $atencion,
                    'quizz_question_id' => 6
                ]);
            }else{
                QuizzAnswer::create([
                    'answer' => "NO",
                    'solicitud_id' =>  $atencion,
                    'quizz_question_id' => 6
                ]);
            }


            //Anticonceptivos
            if($this->anticonceptivos == "SI"){
                QuizzAnswer::create([
                    'answer' => $this->anticonceptivoSi,
                    'solicitud_id' =>  $atencion,
                    'quizz_question_id' => 7
                ]);
            }else{
                QuizzAnswer::create([
                    'answer' => "NO",
                    'solicitud_id' =>  $atencion,
                    'quizz_question_id' => 7
                ]);
            }




            //Algo más
            QuizzAnswer::create([
                    'answer' => $this->algoMas,
                    'solicitud_id' =>  $atencion,
                    'quizz_question_id' => 10
                ]);

                $this->currentPage ++;
                $this->pages[3]['porcentaje'] = 100;
                $this->pages[4]['porcentaje'] = 100;
                $this->pages[5]['bgColor'] = 'bg-green-500';
                $this->pages[5]['txtColor'] = 'text-white';

              /*   dd($this->agendaSelect['id']); */

    }

    public $pages = [
            1=> [
                'heading'=> 'Profesionales',
                'subheading'=> 'first',
                'porcentaje'=> 10,
                'bgColor' => 'bg-green-500',
                'txtColor' => 'text-white'
            ],
            2=> [
                'heading'=> 'Agenda',
                'subheading'=> 'second',
                'porcentaje'=> 0,
                'bgColor' => 'bg-white',
                'txtColor' => 'text-gray-600'
            ],
            3=> [
                'heading'=> 'Antecedentes',
                'subheading'=> 'third',
                'porcentaje'=> 0,
                'bgColor' => 'bg-white',
                'txtColor' => 'text-gray-600'
            ],
            4=> [
                'heading'=> 'Imágenes',
                'subheading'=> 'fourth',
                'porcentaje'=> 0,
                'bgColor' => 'bg-white',
                'txtColor' => 'text-gray-600'
            ],
            5=> [
                'heading'=> 'Pago',
                'subheading'=> 'fifth',
                'porcentaje'=> 0,
                'bgColor' => 'bg-white',
                'txtColor' => 'text-gray-600'
            ],
            6=> [
                'heading'=> 'Finalizado',
                'subheading'=> 'sixth',
                'porcentaje'=> 0,
                'bgColor' => 'bg-white',
                'txtColor' => 'text-gray-600'
            ]
    ];

    public function mount($paciente){
        
        $this->paciente = Patient::find($paciente);
        $this->doctors = Doctor::where('state',1)->get();
        $this->precio;

    }

    public function render()
    {
        

        return view('livewire.steps');
    }


    public function goToNextPage(){

        /* dd($this->currentPage); */
        if($this->currentPage == 1){
           return $this->validateUno();

        }elseif($this->currentPage == 2){

            return $this->validateDos();

        }elseif($this->currentPage == 3){

            return $this->validarTres();

        }elseif($this->currentPage == 4){

            return $this->validateCuatro();

        }elseif($this->currentPage == 5){

            return $this->validateCinco();

        }elseif($this->currentPage == 6){

            return $this->validateSeis();

        }elseif($this->currentPage == 7){

            return $this->validateSiete();

        }else{

        }

    }

    public function goToPreviousPage(){

        if($this->currentPage === 2){

            $this->pages[1]['porcentaje'] = 50;
            $this->pages[2]['porcentaje'] = 0;
            $this->pages[2]['bgColor'] = 'bg-white';
            $this->pages[2]['txtColor'] = 'text-gray-600';


         }elseif($this->currentPage === 3){

            $this->pages[2]['porcentaje'] = 50;
            $this->pages[3]['porcentaje'] = 0;
            $this->pages[3]['bgColor'] = 'bg-white';
            $this->pages[3]['txtColor'] = 'text-gray-600';

         }elseif($this->currentPage === 4){

            $this->pages[3]['porcentaje'] = 50;
            $this->pages[4]['porcentaje'] = 0;
            $this->pages[4]['bgColor'] = 'bg-white';
            $this->pages[4]['txtColor'] = 'text-gray-600';

         }elseif($this->currentPage === 5){

            $this->pages[4]['porcentaje'] = 50;
            $this->pages[5]['porcentaje'] = 0;
            $this->pages[5]['bgColor'] = 'bg-white';
            $this->pages[5]['txtColor'] = 'text-gray-600';

         }
         $this->currentPage--;

    }

    public function validateUno(){

            $this->currentPage++;
            $this->pages[1]['porcentaje'] = 100;
            $this->pages[2]['porcentaje'] = 50;
            $this->pages[2]['bgColor'] = 'bg-green-500';
            $this->pages[2]['txtColor'] = 'text-white';

            $atencion = Solicitud::create([
                'solicitud_type_id' => 1,
                'doctor_id' => $this->doc->id,
                'patient_id' => $this->paciente->id,
                'quizz_id' => 1,
                'attention_date' => \Carbon\Carbon::now(),
                'status' => 0,
                'payment_id' =>0,
                'schedule_id' =>0,
            ]);


            $this->agendas = Schedule::where('user_id', $this->doc->user->id)->orderBy('fecha_disponible','ASC')->get();

            Session::put('attention_id',$atencion->id);

            $this->errReset();

            ;
            $this->precio = $atencion->solicitud_type->price;

           //dd($this->precio);

    }

    public function validateDos(){

            $this->currentPage++;
            $this->pages[2]['porcentaje'] = 100;
            $this->pages[3]['porcentaje'] = 0;
            $this->pages[3]['bgColor'] = 'bg-green-500';
            $this->pages[3]['txtColor'] = 'text-white';
            $this->errReset();

    }




    public function errReset(){
        $this->firstErr = false;
        $this->dateErr = false;
        $this->sexoErr = false;
        $this->embarazoErr = false;
        $this->pesoErr = false;
        $this->mensaje = "";
        $this->mensajeCirugia = "";
        $this->mensajeAlergia = "";
        $this->mensajeAmamanta= "";
        $this->mensajeEmbarazo = "";
        $this->mensajeMedicamento = "";
    }

    public function select(){

            $this->selectModal = '';
            $this->goToNextPage();

    }


     /* Funciones pagina 2 */
     public function agendar(){
      
        $solicitud = Session::get('attention_id');
        // $this->goToNextPage();
        return redirect()->route('solicitud.show');
    }

    public function sexo($id){

        if($id == "Mujer"){
            $this->sexo = "Mujer";
        }elseif($id == "Hombre"){
            $this->sexo = "Hombre";
            $this->embarazo = 'No';
            $this->amamanta = 'No';
        }else{
            $this->sexo = "Otro";
        }

       }

    /* Funciones pagina 3 */
    // public function otraPatologia(){

    //     if($this->otraPatologiaVisible === 1 ){
    //         $this->otraPatologiaVisible = 0;
    //     }else{
    //         $this->otraPatologiaVisible = 1;
    //         $this->otraPatologia = '';
    //     }
    //     $this->errReset();
    // }

    public function limpiar(){
        $this->errReset();
    }

    public function validarTres(){

        if($this->mensajePrimero == ''){
            $this->mensajePrimero = "*Debe ingresar algun medicamento actual";
        }else{
                $this->currentPage++;
                $this->pages[3]['porcentaje'] = 12.5;
                $this->errReset();
        }

    }

    /* Funciones pagina 4 */

   public function cirugia($id){
    if($id == "NO"){
        $this->cirugias = "NO";
        $this->cirugiasVisible =0;
        $this->cirugiaSi ='';
    }else{
        $this->cirugias = "SI";
        $this->cirugiasVisible =1;

    }
    $this->errReset();
   }

   public function validateCuatro(){

    if($this->cirugias === 'SI'){
        if($this->cirugiaSi === ''){
            $this->mensajeCirugia = "*Campo Obligatorio alérgico a algún medicamento";
                }else{
                    $this->currentPage++;
                    $this->pages[3]['porcentaje'] = 25;
                    $this->errReset();
                }
        }elseif($this->cirugias === 'NO'){
            $this->currentPage++;
            $this->pages[3]['porcentaje'] = 25;
            $this->errReset();
        }else{
            $this->mensajeCirugia = "*Debe seleccionar una opción";
        }
    }

    /* Funciones pagina 5 */


    public function alergia($id){
    if($id == "NO"){
        $this->alergias = "NO";
        $this->alergiasVisible =0;
        $this->alergiaSi ='';
    }else{
        $this->alergias = "SI";
        $this->alergiasVisible =1;

    }
    $this->errReset();
   }

   public function validateCinco(){

    if($this->alergias === 'SI'){
        if($this->alergiaSi === ''){
            $this->mensajeAlergia = "*Campo Obligatorio patologías ";
                }else{
                    $this->currentPage++;
                    $this->pages[3]['porcentaje'] = 37.5;
                    $this->errReset();
                }
        }elseif($this->alergias === 'NO'){
            $this->currentPage++;
            $this->pages[3]['porcentaje'] = 37.5;
            $this->errReset();
        }else{
            $this->mensajeAlergia = "*Debe seleccionar una opción";
        }
    }

       /* Funciones pagina 6 */

   public function medicamento($id){
    if($id == "NO"){
        $this->medicamentos = "NO";
        $this->medicamentosVisible = 0;
        $this->medicamentoSi ='';
    }else{
        $this->medicamentos = "SI";
        $this->medicamentosVisible = 1;

    }
    $this->errReset();
   }

   public function validateSeis(){

    if($this->medicamentos === 'SI'){
        if($this->medicamentoSi === ''){
            $this->mensajeMedicamento = "*Campo Obligatorio Cirugías";
                }else{
                    $this->currentPage++;
                    $this->pages[3]['porcentaje'] = 50;
                    $this->errReset();
                }
        }elseif($this->medicamentos === 'NO'){
            $this->currentPage++;
            $this->pages[3]['porcentaje'] = 50;
            $this->errReset();
        }else{
            $this->mensajeMedicamento = "*Debe seleccionar una opción";
        }

    }

       /* Funciones pagina 7 */

   public function anticonceptivo($id){
    if($id == "NO"){
        $this->anticonceptivos = "NO";
        $this->anticonceptivosVisible =0;
        $this->anticonceptivoSi = '';
    }else{
        $this->anticonceptivos = "SI";
        $this->anticonceptivosVisible =1;

    }
    $this->errReset();
   }

   public function validateSiete(){

    if( $this->sexo == "Hombre"){
        $this->currentPage = $this->currentPage + 3;
        $this->pages[3]['porcentaje'] = 87.5;
        $this->errReset();
    }else{

        if($this->anticonceptivos === 'SI'){
            if($this->anticonceptivoSi === ''){
                $this->mensajeAnticonceptivo = "*Indicar cual es la observacion porfavor";
                    }else{
                        $this->currentPage++;
                        $this->pages[3]['porcentaje'] = 62.5;
                        $this->errReset();
                    }
            }elseif($this->anticonceptivos === 'NO'){
                $this->currentPage++;
                $this->pages[3]['porcentaje'] = 62.5;
                $this->errReset();
            }else{
                $this->mensajeAnticonceptivo = "*Debe seleccionar una opción";
            }
        }

    }

       /* Funciones pagina 8 */

   public function embarazo($id){

    if($id == "NO"){
        $this->embarazo = "NO";
        $this->embarazoVisible =0;
        $this->embarasoSi = '';
    }else{
        $this->embarazo = "SI";
        $this->embarazoVisible =1;

    }
    $this->errReset();
   }

   public function validateOcho(){

    if($this->embarazo == 'SI'){
        if($this->embarazoSi == ''){
            $this->mensajeEmbarazo = "*Campo Obligatorio";
                }else{
                    $this->currentPage++;
                    $this->pages[3]['porcentaje'] = 75;
                    $this->errReset();
                }
        }elseif($this->embarazo == 'NO'){
            $this->currentPage++;
            $this->pages[3]['porcentaje'] = 75;
            $this->errReset();
        }else{
            $this->mensajeEmbarazo = "*Debe seleccionar una opción";
        }
    }

      /* Funciones pagina 9 */

   public function amamanta($id){
    if($id == "NO"){
        $this->amamanta = "NO";
    }else{
        $this->amamanta = "SI";

    }
    $this->errReset();
   }

   public function validateNueve(){

    if($this->amamanta === 'SI'){

            $this->currentPage++;
            $this->pages[3]['porcentaje'] = 87.5;
            $this->errReset();

        }elseif($this->amamanta === 'NO'){
            $this->currentPage++;
            $this->pages[3]['porcentaje'] = 87.5;
            $this->errReset();
        }else{
            $this->mensajeAmamanta = "*Debe seleccionar una opción";
        }

    }

        /* Funciones pagina 9 */
        public function validateDiez(){

            if($this->algoMas != ''){
            $this->currentPage ++;
         /*    $this->currentPage ++;
            $this->currentPage ++; */
            $this->pages[3]['porcentaje'] = 100;
            $this->pages[4]['porcentaje'] = 0;
            $this->pages[4]['bgColor'] = 'bg-green-500';
            $this->pages[4]['txtColor'] = 'text-white';
            $this->errReset();
            }else{
                $this->mensajeMotivo = '*Debe ingresra el motivo con detalle de su consulta';
            }
        }

        /*Funciones pagina 10*/
        public $precio;

        public function validateOnce(){

        }

        public function imagenesFiles(){
            $this->imagenes = 1;
        }


        public function control(){
            return redirect()->route('paciente.show',[auth()->user()->patient->id, auth()->user()->id]);
        }

        public function repetirReceta(){
            return redirect()->route('paciente.show',[auth()->user()->patient->id, auth()->user()->id]);
        }

}
