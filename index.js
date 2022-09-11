const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

const fs = require('fs');

app.use(express.static(__dirname+'/public'))
// Parse URL-encoded bodies (as sent by HTML forms)
// app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
router.get('/',function(req,res){
    var name = "hello";
    res.sendFile(path.join(__dirname+'/page/html/insert.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/about.html'));
});

router.get('/daftarpasien',function(req,res){
  res.sendFile(path.join(__dirname+'/page/html/listpasien.html'));
});

router.get('/insert',function(req,res){
  res.sendFile(path.join(__dirname+'/page/html/insert.html'));
});

router.get('/readpasien',(req, res)=>{
    var ret = ""
    fs.readFile('./db/pasien.json', (err, data) => {
        if (err) throw err;
        let pasien = JSON.parse(data);
        ret = pasien
        res.send({
            status: "200",
            data: ret
        })
    });
})

router.post('/insertdata',(req, res)=>{
    console.log(req.body)
    pasienBaru = req.body.pasien
    fs.readFile('./db/pasien.json', (err, data) => {
            if (err) {
              res.status(500).send({
                status: 500,
                message: "Gagal"
              })
            };
            try {
              let pasien = JSON.parse(data);

              var dataPasien = pasien.dataPasien
              // console.log(dataPasien)
              pasienBaru.id = dataPasien[dataPasien.length-1].id+1
              
              dataPasien.push(pasienBaru)
              var dataFinal = {
                  dataPasien
              } 

              fs.writeFile('./db/pasien.json', JSON.stringify(dataFinal, null, 2), (err) =>{
                  if (err) throw err;
                  console.log('Data written to file');
              })

              var initDiagnosa = {
                diagnosa:[]
              }

              fs.writeFile('./db/diagnosa/'+pasienBaru.id+'.json', JSON.stringify(initDiagnosa, null, 2), (err)=>{
                if(err) throw err
                console.log("Diagnosa File Created")
              })
              
              res.send({
                  status:200,
                  message: "Data Berhasil Diinput"
              })
            } catch (error) {
              console.log(error)
              res.status(500).send({
                status: 500,
                message: "Gagal"
              })
            }
            
        });
})

router.post('/editdata', (req, res)=>{
  console.log(req.body)
  var dataUpdate = req.body
  if(dataUpdate.type == 'pasien'){
    fs.readFile('./db/pasien.json', (err, data) => {
            if (err) {
              res.status(500).send({
                status: 500,
                message: "Gagal"
              })
            };
            try {
              let pasien = JSON.parse(data);

              var dataPasien = pasien.dataPasien
              // console.log(dataPasien)
              // var i = 0;
              // var iPas = 'x'
              // dataPasien.forEach(pas => {
              //   if(pas.id == data.id){
              //     console.log("Pasien Ditemukan")
              //     this.iPas = i
              //     throw iPas
              //   }
              //   console.log(i)
              //   i = i+1
              // });

              var iPas = dataPasien.findIndex(p => p.id == dataUpdate.id)
            
              if (iPas == -1) {
                res.status(404).send({
                  status:404,
                  message: "Pasien Tidak Ditemukan"
                })
              }else{
                dataPasien[iPas].nama = dataUpdate.pasien.nama
                dataPasien[iPas].dob = dataUpdate.pasien.dob
                dataPasien[iPas].umur = dataUpdate.pasien.umur
                dataPasien[iPas].alergi = dataUpdate.pasien.alergi
                dataPasien[iPas].alamat = dataUpdate.pasien.alamat

                // console.log(dataPasien[iPas])
              
                var dataFinal = {
                    dataPasien
                } 
                fs.writeFile('./db/pasien.json', JSON.stringify(dataFinal, null, 2), (err) =>{
                    if (err) throw err;
                    console.log('Data written to file');
                })
                
                res.send({
                    status:200,
                    message: "Data Berhasil Diedit"
                })
              }
             
            } catch (error) {
              console.log(error)
              res.status(500).send({
                status: 500,
                message: "Gagal"
              })
            }
            
        });
  }
})

router.post('/listdiagnosa',  (req, res)=>{
  console.log(req.body)

  var listDiagnosa = req.body

  var initDiagnosa = {
    diagnosa:[]
  }

  fs.readFile('./db/diagnosa/'+listDiagnosa.idPasien+'.json', (err, data)=>{
    if(err){
      console.log(err)
      fs.writeFile('./db/diagnosa/'+listDiagnosa.idPasien+'.json', JSON.stringify(initDiagnosa, null, 2), (err)=>{
        if(err) throw err
        console.log("Diagnosa File Created")
        }
      )

      res.status(404).send({
        status: 404,
        message: "Belum ada data"
      })

    }else{
      try{
        let diag = JSON.parse(data);
        var diagnosaPasien = diag
        res.send({
            status:200,
            message: "Data ditemukan",
            data: { 
              idPasien: listDiagnosa.idPasien,
              diagnosa: diagnosaPasien.diagnosa
            }
        })
  
      }catch(err){
        console.log(err)
        res.status(500).send({
          status: 500,
          message: "Gagal"
        })
      }
    }

  })
})

router.post('/insertdiagnosa',  (req, res)=>{
  console.log(req.body)

  diagnosaBaru = req.body

  var initDiagnosa = {
    diagnosa:[]
  }

  fs.readFile('./db/diagnosa/'+diagnosaBaru.idPasien+'.json', (err, data)=>{
    if(err){
      console.log(err)
      fs.writeFile('./db/diagnosa/'+diagnosaBaru.idPasien+'.json', JSON.stringify(initDiagnosa, null, 2), (err)=>{
        if(err) throw err
        console.log("Diagnosa File Created")
        }
      )
    }

    try{
      let diag = JSON.parse(data);
      var diagnosaPasien = diag.diagnosa
      var idDiagnosa
      console.log(diagnosaPasien)
      if (diagnosaPasien.length == 0) {
        idDiagnosa = 1
      }else{
        idDiagnosa = diagnosaPasien[diagnosaPasien.length - 1].id+1
      }

      var diagnosa = {
        id: idDiagnosa,
        tanggal: diagnosaBaru.tanggal,
        amnesis: diagnosaBaru.amnesis,
        diagnosa: diagnosaBaru.diagnosa,
        terapi: diagnosaBaru.terapi,
      }

      diagnosaPasien.push(diagnosa)

      var diagnosaFinal = {
        diagnosa: diagnosaPasien
      }

      fs.writeFile('./db/diagnosa/'+diagnosaBaru.idPasien+'.json', JSON.stringify(diagnosaFinal, null, 2), (err)=>{
        if(err) throw err;
        console.log('Data written to file')
      })

      res.send({
          status:200,
          message: "Data Berhasil Diinput"
      })

    }catch(err){
      console.log(err)
      res.status(500).send({
        status: 500,
        message: "Gagal"
      })
    }
  })
})

router.post('/deleteDiagnosa', (req, res)=>{
  console.log(req.body)
  var delData = req.body

  fs.readFile('./db/diagnosa/'+delData.idPasien+'.json',(err, data)=>{
    if(err){
      console.log(err)
      throw err
    }

    let dataDiagnosa = JSON.parse(data)

    var firstLength = dataDiagnosa.diagnosa.length
    console.log(firstLength)

    var indexOfData = dataDiagnosa.diagnosa.findIndex(x => x.id === delData.idDiagnosa)

    if(indexOfData > -1){
      dataDiagnosa.diagnosa.splice(indexOfData,1)
    }

    var diagnosaFinal = {
        diagnosa: dataDiagnosa.diagnosa
    }
    
    if (firstLength > dataDiagnosa.diagnosa.length) {
      fs.writeFile('./db/diagnosa/'+delData.idPasien+'.json', JSON.stringify(diagnosaFinal, null, 2), (err)=>{
        if(err) throw err;
        console.log('Data written to file')
      })
  
      res.send({
          status:200,
          message: "Data Berhasil dihapus"
      })
    }else{
      res.status(500).send({
          status:500,
          message: "Something went wrong"
      })
    }
  })
})

//add the router
app.use('/', router);
app.listen(process.env.port || 3000);


console.log('Running at Port 3000');

module.exports = app
