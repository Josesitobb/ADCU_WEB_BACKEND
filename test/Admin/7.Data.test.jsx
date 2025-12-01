const { Builder, Browser, By, XS, Key, Select, until } = require('selenium-webdriver');

let driver;


describe('Gestion de Datos Administrativos', function () {

    // Abrir el navegador
    it('Abrir el navegador', async function () {
        try {
            driver = new Builder().forBrowser(Browser.EDGE).build();
            await driver.get('http://localhost:3000/login');
            await driver.manage().window().maximize();
        } catch (e) {
            console.log(e)
        }
    });

    it('Login como Administrador', async function () {
        try {
            const emailInput = await driver.wait(until.elementLocated(By.id('formBasicEmail')), 5000);
            const passwordInput = await driver.wait(until.elementLocated(By.id('formBasicPassword')), 5000);
            const clickButton = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div/div[2]/form/button')), 5000);
            if (!emailInput || !passwordInput || !clickButton) throw new Error('No se encuentra el input email o contraseña o el boton');
            await emailInput.sendKeys('admin@example.com');
            await passwordInput.sendKeys('CarlosAdmin2024');
            await clickButton.click();
            // Esperar el mensaje
            const alertOk = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/h2')), 20000);
            if (!alertOk) throw new Error('Error no inicia con la clave del adminitrador');
            await driver.sleep(2000);
        } catch (e) {
            console.log(e)
        }
    });

    it('Gestion de datos Crear un comparacion', async function () {

        try {

            // Buscar el lateral izquierdo  y seleccionar contrato
            const buttonInicio = await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/button[1]'));
            await driver.wait(until.elementIsVisible(buttonInicio), 2000);
            buttonInicio.click();

            // Boton del menu de usuario
            const buttonData = await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/div/nav/a[3]'));
            await driver.wait(until.elementIsVisible(buttonData), 2000);
            buttonData.click();

            await driver.manage().setTimeouts({ implicit: 2000 });

            // Select de usuarios contratistas
            const selectContract = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[3]/div/div/div[2]/div/select'));
            const select = new Select(selectContract);
            await select.selectByIndex(1);


            // DALR CLICK A ESE PIROBO SELECTOR
            await driver.sleep(5000);

           await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/button[3]')).click();


            const selectContractId = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[1]/select'));
            const selectId2 = new Select(selectContractId);
            await selectId2.selectByIndex(1);


            const selectContractDatamanage = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[2]/select'));
            const selectDatamange = new Select(selectContractDatamanage);
            await selectDatamange.selectByIndex(1);


            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/button[2]')).click();



        } catch (e) {
            console.log(e)
        }
    });

    it('Gestion de dato boton de ver', async function () {
        try {
            // Click en el boton de ver
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[2]/td[3]/div/button[1]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[2]/td[3]/div/button[1]')).click();
            await driver.manage().setTimeouts({ implicit: 2000 });

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[3]/td[3]/div/button[1]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[3]/td[3]/div/button[1]')).click();
            await driver.manage().setTimeouts({ implicit: 2000 });

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[4]/td[3]/div/button[1]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[4]/td[3]/div/button[1]')).click();
            await driver.manage().setTimeouts({ implicit: 2000 });

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[5]/td[3]/div/button[1]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[5]/td[3]/div/button[1]')).click();
            await driver.manage().setTimeouts({ implicit: 2000 });

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[6]/td[3]/div/button[1]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[6]/td[3]/div/button[1]')).click();
            await driver.manage().setTimeouts({ implicit: 2000 });

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[7]/td[3]/div/button[1]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[7]/td[3]/div/button[1]')).click();

            await driver.sleep(5000);

        }
        catch (e) {
            console.log(e)
        }
    });




    it('Gestion de datos Cambiar estado del analisis', async function () {

        try {

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[2]/td[3]/div/button[2]')).click();

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[3]/td[3]/div/button[2]')).click();

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[4]/td[3]/div/button[2]')).click();

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[5]/td[3]/div/button[2]')).click();

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[6]/td[3]/div/button[2]')).click();

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[7]/td[3]/div/button[2]')).click();

            await driver.manage().setTimeouts({ implicit: 9000 });


        } catch (e) {
            console.log(e)
        }


    });


    it('Gestion de datos volver a enviar para analisis', async function () {

        try {
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[2]/td[3]/div/button[3]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[3]/td[3]/div/button[3]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[4]/td[3]/div/button[3]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[5]/td[3]/div/button[3]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[6]/td[3]/div/button[3]')).click();
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[4]/div[2]/div/table/tbody/tr[7]/td[3]/div/button[3]')).click();
            await driver.manage().setTimeouts({ implicit: 2000 });
            await driver.sleep(2000);

        } catch (e) {
            console.log(e)
        }

    });
});