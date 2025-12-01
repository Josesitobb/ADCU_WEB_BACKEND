const { Builder, Browser, By, XS, Key, Select, until } = require('selenium-webdriver');
const path = require("path");


describe('Crear toda la gestion documental ', function () {
    let driver;

    // beforeEach(async function () {
    //     driver = await new Builder().forBrowser(Browser.EDGE).build();
    //     driver.get('https://adcu.giize.com/login');
    //     driver.manage().window().maximize();
    // })


    // afterEach(async function () {
    //     // driver.quit();
    // });


    it('Abrir navegador', async function () {
        try {
            driver = new Builder().forBrowser(Browser.EDGE).build();
            await driver.get('http://localhost:3000/login');
            // await driver.get('https://adcu.giize.com/login');
            await driver.manage().window().maximize();
        } catch (e) {
            console.log(e)
        }

    });


    it('Login para crear una gestion documental', async function () {
        try {
            const emailInput = await driver.wait(until.elementLocated(By.id('formBasicEmail')), 5000);
            const passwordInput = await driver.wait(until.elementLocated(By.id('formBasicPassword')), 5000);
            const clickButton = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div/div[2]/form/button')), 5000);
            if (!emailInput || !passwordInput || !clickButton) throw new Error('No se encuentra el input email o contraseña o el boton');

            // await driver.wait(until.elementIsVisible(emailInput),5000);

            await emailInput.sendKeys('admin@example.com');

            await passwordInput.sendKeys('CarlosAdmin2024');

            await clickButton.click();

            // Esperar el mensae
            const alertOk = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/h2')), 20000);

            if (!alertOk) throw new Error('Error no inicia con la clave del adminitrador');

            await driver.sleep(2000);

        } catch (e) {
            console.log(e)
        }



    });
    it('Crear una gestion documental', async function () {
        // Buscar el lateral izquierdo  y seleccionar gestion documental
        const buttonInicio = await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/button'));
        await driver.wait(until.elementIsVisible(buttonInicio), 2000);
        buttonInicio.click();

        const buttonDocumentmanagement = await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/div/nav/button[2]'));
        await driver.wait(until.elementIsVisible(buttonDocumentmanagement), 2000);
        buttonDocumentmanagement.click();

        await driver.manage().setTimeouts({ implicit: 2000 });

        //Boton de entrar a la gestion documental
        const elemento = await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/div/nav/div/a'));
        await driver.wait(until.elementIsVisible(elemento), 2000);
        elemento.click();

        await driver.manage().setTimeouts({ implicit: 2000 });

        //  Comenzar a llenar el formulario

        // Boton de agregar las gestion documental
        const buttonFormData = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div[2]/button[2]'));
        await driver.wait(until.elementIsVisible(buttonFormData), 5000);
        buttonFormData.click();


        await driver.manage().setTimeouts({ implicit: 5000 });

        // Seleccionar un contratista
        const selectUserContract = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[1]/select'));
        const select = new Select(selectUserContract);
        await select.selectByIndex(2);

        // Input de descripcion
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[2]/input')).sendKeys('PruebaBotSelenium');

        // Dar click en el boton
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/h2/button')).click();

        // Esperar el titulo
        const titleDocuments = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[1]')));
        await driver.wait(until.elementIsVisible(titleDocuments));

        // Documentos
        const pathCartadeRadicación = path.resolve(__dirname, '../../Archivos_de_prueba/01 - CARTA DE RADICACION DE CUENTA DE COBRO.pdf');
        const pathCertificadoDeumplimiento = path.resolve(__dirname, '../../Archivos_de_prueba/02 - CERTIFICADO DE CUMPLIMIENTO (3) 422 FIRMADO.pdf');
        const pathCertificadoDeCumplimientoFirmado = path.resolve(__dirname, '../../Archivos_de_prueba/02 - CERTIFICADO DE CUMPLIMIENTO.pdf');
        const pathReporteDeActividad = path.resolve(__dirname, '../../Archivos_de_prueba/03 - Informe Actividades.pdf');
        const pathCertificadoDeCalidadTributaria = path.resolve(__dirname, '../../Archivos_de_prueba/04 - CERTIFICADO CALIDAD TRIBUTARIA.pdf');
        const pathSeguridadSocial = path.resolve(__dirname, '../../Archivos_de_prueba/5. Copia Planilla de Pago Seguridad Social.pdf');
        const pathRUT = path.resolve(__dirname, '../../Archivos_de_prueba/6. RUT.pdf');
        const pathRIT = path.resolve(__dirname, '../../Archivos_de_prueba/7. RIT.pdf');
        const pathCapacitaciones = path.resolve(__dirname, '../../Archivos_de_prueba/8. Capacitacion SST.pdf');
        const pathActaDeInicio = path.resolve(__dirname, '../../Archivos_de_prueba/9. ACTA DE INICIO. FALKONERTH ROZO ALBA STELLA (1).pdf');
        const pathCertificaciónBancaria = path.resolve(__dirname, '../../Archivos_de_prueba/10. Certificado de cuenta.pdf');


        // Enviar documentos a el formualrio

        // Carta de radicaion
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[1]/div/input')).sendKeys(pathCartadeRadicación);
        // Certificado de cumplimient
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[2]/div/input')).sendKeys(pathCertificadoDeumplimiento);
        // Certificado de cumplimiento firmado
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[3]/div/input')).sendKeys(pathCertificadoDeCumplimientoFirmado);
        // Reporte de actividad
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[4]/div/input')).sendKeys(pathReporteDeActividad)
        // Certificado de calidad tributaria
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[5]/div/input')).sendKeys(pathCertificadoDeCalidadTributaria)
        // Seguridad social
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[6]/div/input')).sendKeys(pathSeguridadSocial)
        // Rut
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[7]/div/input')).sendKeys(pathRUT)
        // Rit
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[8]/div/input')).sendKeys(pathRIT)
        // Capacitaciones
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[9]/div/input')).sendKeys(pathCapacitaciones)
        // Acta de inicio
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[10]/div/input')).sendKeys(pathActaDeInicio)
        // Certificacion bancaria
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div[2]/div[11]/div/input')).sendKeys(pathCertificaciónBancaria)


        // Dar en el boton aceptar
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[5]/button[2]')).click();

        // Esperar a que ne la tabla haya un pruebas
        const alerOk = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div[2]/div[3]/div[2]/div/table/tbody/tr[2]/td[2]')), 10000);

        await driver.wait(until.elementIsVisible(alerOk), 10000);


        await driver.sleep(2000);


    });

    it('Editar una gestion documental', async function () {
        const buttonEditDocument = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div[2]/div[3]/div[2]/div/table/tbody/tr[2]/td[6]/div/button[1]')), 2000);
        await driver.wait(until.elementIsVisible(buttonEditDocument), 2000);
        await buttonEditDocument.click();

        // Seleccionar un contratista
        const selectUserContract = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[1]/select'));
        const select = new Select(selectUserContract);
        await select.selectByIndex(2);

        const descriptionInput = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[2]/input'));
        await descriptionInput.clear();
        await descriptionInput.sendKeys('Gestion documental editada');

        // Escribir con en el campo de retencio
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[3]/div[2]/div/input')).sendKeys('6');

        // Documentos a editar
        const pathCartadeRadicación = path.resolve(__dirname, '../../Archivos_de_prueba/01 - CARTA DE RADICACION DE CUENTA DE COBRO.pdf');
        const pathCertificadoDeumplimiento = path.resolve(__dirname, '../../Archivos_de_prueba/02 - CERTIFICADO DE CUMPLIMIENTO (3) 422 FIRMADO.pdf');
        const pathRUT = path.resolve(__dirname, '../../Archivos_de_prueba/6. RUT.pdf');
        const pathCertificaciónBancaria = path.resolve(__dirname, '../../Archivos_de_prueba/10. Certificado de cuenta.pdf');

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div/div[1]/div/input')).sendKeys(pathCartadeRadicación);

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div/div[3]/div/input')).sendKeys(pathCertificaciónBancaria);

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div/div[7]/div/input')).sendKeys(pathRUT);

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div/div/div/div/div[11]/div/input')).sendKeys(pathCertificaciónBancaria);

        // Dar click en el boton editar
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[5]/button[2]')).click();

        // Esperar la notificacion

        const tabletOk = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div[2]/div[3]/div[2]/div/table/tbody/tr[2]/td[2]')), 2000);
        await driver.wait(until.elementIsVisible(tabletOk));

        
        await driver.sleep(2000);
        

    });


    it('Borrar un solo documento', async function () {
        const buttonEditOneDocument = driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div[2]/div[3]/div[2]/div/table/tbody/tr[2]/td[6]/div/button[2]')), 2000);
        await driver.wait(until.elementIsVisible(buttonEditOneDocument), 9000);
        await buttonEditOneDocument.click();
        // Esperar a que aparezca el titulo
        await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div[1]/div')), 5000);

        // Seleccionar 
        const selectUserContract = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div[3]/select'));
        const select = new Select(selectUserContract);

        await select.selectByIndex(2);
        // Boton de eliminar
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div[4]/button[2]')).click();
        // Aceptar alerta
        await driver.switchTo().alert().accept();
        // Eseperar que salga la alerta 
        const alerOk = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/section/ol/li/div[2]/div')), 2000);
        await driver.wait(until.elementIsVisible(alerOk), 2000);

        await driver.sleep(2000);
    });

    it('Borrar un gestion documental', async function () {

        const buttonDelete = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div[2]/div[3]/div[2]/div/table/tbody/tr[2]/td[6]/div/button[3]')))
        await driver.wait(until.elementIsVisible(buttonDelete));
        await buttonDelete.click();
        // Aceptar alerta
        await driver.switchTo().alert().accept();

        await driver.sleep(2000);
    })

})