const { Builder, Browser, By, XS, Key, Select, until } = require('selenium-webdriver');

let driver;

describe('Crear toda la gestion de un contrato en la aplicacion de adcu en admin', function () {

    beforeEach(async function () {
    });

    afterEach(async function () {
    })

    it('Abrir navegador', async function () {
        try {
            driver = new Builder().forBrowser(Browser.EDGE).build();
           
            await driver.get('https://adcu.giize.com/login');
            await driver.manage().window().maximize();
        } catch (e) {
            console.log(e)
        }

    });


    it('Login para crear un contrato', async function () {
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

    it('Crear un contrato', async function () {
        try {
            // Buscar el lateral izquierdo  y seleccionar contrato
            const buttonInicio = await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/button'));
            await driver.wait(until.elementIsVisible(buttonInicio), 2000);
            buttonInicio.click();


            const buttonContract = await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/div/nav/a[2]'));
            await driver.wait(until.elementIsVisible(buttonContract), 2000);
            buttonContract.click();


            //    Espera a que cargue el titulo
            await driver.wait(until.elementsLocated(By.xpath('//*[@id="root"]/div/div[2]/div/div/div[1]/div/h3')), 2000);
            const buttonNewContract = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div/div/div[1]/button'));
            await driver.wait(until.elementIsVisible(buttonNewContract), 2000);
            buttonNewContract.click();


            // CREAR UN USUARIO

            // Llenar el formulario 
            await driver.manage().setTimeouts({ implicit: 2000 });

            // SELECT
            const selectTypeOfContract = await driver.findElement(By.name('typeofcontract'));
            const select = new Select(selectTypeOfContract);

            // Elemento el que quiero que sea seleccionado
            await driver.findElement(By.css('option[value=Aprendizaje]'));
            await select.selectByVisibleText('Aprendizaje');

            // Fechas
            await driver.findElement(By.xpath('//*[@id="startDate"]')).sendKeys('01/01/2019');
            await driver.findElement(By.xpath('//*[@id="endDate"]')).sendKeys('01/01/2025');

            const numberContract = Math.floor(Math.random() * 10000)

            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[3]/input')).sendKeys(numberContract)

            // Valor del periodo
            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div[1]/div/input')).sendKeys('100')
            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div[2]/div/input')).sendKeys('1000')

            // Objetivo del contrato
            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[5]/textarea')).sendKeys('PRUEBAS');

            // Boton de guardar
            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[3]/button[2]')).click();

            // Esperar a la alerta que confirme la creacion
            await driver.wait(until.elementsLocated(By.xpath('//*[@id="root"]/section/ol/li/div[2]/div')), 20000);

            await driver.sleep(2000);


        } catch (e) {
            console.log(e)
        }


    });

    it('Editar un contrato', async function () {

        try {
            // EDITAR UN CONTRATO
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div/div/div[2]/table/tbody/tr[4]/td[12]/div/button[1]')).click();

            await driver.manage().setTimeouts({ implicit: 2000 });

            // Editar el numero de contrato
            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[3]/input')).sendKeys('12312312312312312');

            // Valor periodo
            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div[1]/div/input')).sendKeys('1');
            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/div[2]/div/input')).sendKeys('2');

            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[5]/textarea')).sendKeys('PRUEBA 2')

            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[3]/button[2]')).click();

            await driver.wait(until.elementsLocated(By.xpath('//*[@id="root"]/section/ol/li/div[2]/div[2]')));

            await driver.sleep(2000);


        } catch (e) {
            console.log(e)
        }


    });


    it('Borrar un contrato', async function () {
        try {
            // BORRAR UN CONTRATO
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div/div/div[2]/table/tbody/tr[4]/td[12]/div/button[2]')).click();

            await driver.manage().setTimeouts({ implicit: 500000 });

            await driver.switchTo().alert().accept();

            await driver.sleep(2000);

        } catch (e) {
            console.log(e)
        }


    });

    it('Cerrar Navegador', async function () {
        await driver.quit();
    })

});




