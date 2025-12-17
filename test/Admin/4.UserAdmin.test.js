const { Builder, Browser, By, XS, Key, Select, until } = require('selenium-webdriver');

let driver;

describe('Crear toda la gestion de usuario admin', function () {


    // Abrir el navegador
    it('Abrir el navegador', async function () {
        try {
            driver = new Builder().forBrowser(Browser.EDGE).build();
            await driver.get('https://adcu.giize.com/login');
            await driver.manage().window().maximize();
        } catch (e) {
            console.log(e)
        }
    });


    it('Login para crear un usuario admin ', async function () {
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

    it('Crear un usuario admin', async function () {
        try {
            // Buscar el lateral izquierdo  y seleccionar contrato
            const buttonInicio = await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/button[1]'));
            await driver.wait(until.elementIsVisible(buttonInicio), 2000);
            buttonInicio.click();

            // Boton del menu de usuario
            const buttonUser = await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/div/nav/button[1]'));
            await driver.wait(until.elementIsVisible(buttonUser), 2000);
            buttonUser.click();

            await driver.manage().setTimeouts({ implicit: 2000 });

            // Boton del menu de usuario
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/div/nav/div/a[1]')).click();

            // Crear el usuario
            await driver.manage().setTimeouts({ implicit: 2000 });

            // Llenar el formulario 

            // Click boton para agregar un nuevo admin

            await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div/div/div[1]/button')).click();

            // Esperar el campo 
            await driver.wait(until.elementsLocated(By.xpath('/html/body/div[3]/div/div/div[2]/form/div/div[1]/div/label')));

            await driver.findElement(By.xpath('//*[@id="firsName"]')).sendKeys('PruebasBotSelenium');
            await driver.findElement(By.xpath('//*[@id="lastName"]')).sendKeys('PruebasBotSelenium');
            await driver.findElement(By.xpath('//*[@id="idcard"]')).sendKeys(123123123123);
            await driver.findElement(By.xpath('//*[@id="telephone"]')).sendKeys(300100200300);
            await driver.findElement(By.xpath('//*[@id="email"]')).sendKeys('PruebasSeleniumAdmin@gmail.com');
            await driver.findElement(By.xpath('//*[@id="password"]')).sendKeys('PruebasContraseña');
            await driver.findElement(By.xpath('//*[@id="post"]')).sendKeys('Bot de pruebas');

            // Click al boton
            await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[3]/button[2]')).click();


            // Esperar que elemento diga ok

            await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/section/ol/li/div[2]/div[1]')), 2000);

            await driver.sleep(2000);

        } catch (e) {

            console.log(e)

        }

    })

    it('Editar un usuario admin', async function () {

        await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div/div/div[2]/table/tbody/tr[3]/td[9]/div/button[1]')).click();


        // Esperar que que aparezca el titulo 
        await driver.wait(until.elementsLocated(By.xpath('/html/body/div[3]/div/div/div[2]/form/div/div[1]/div/label')));


        // Llenar los campos
        const idcard = await driver.findElement(By.xpath('//*[@id="idcard"]'))
        idcard.clear();
        idcard.sendKeys(101012020032);

        const telephone = await driver.findElement(By.xpath('//*[@id="telephone"]'))
        telephone.clear();
        telephone.sendKeys(1202002);

        const email = await driver.findElement(By.xpath('//*[@id="email"]'));
        email.clear();
        email.sendKeys('EditaSeleniumBot@gmail.com')

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[3]/button[2]')).click();


        await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/section/ol/li/div[2]/div[1]')), 2000);


        await driver.sleep(2000);

    });


    it('Borrar un usuario admin', async function () {

        await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div/div/div[2]/table/tbody/tr[3]/td[9]/div/button[2]')).click();

        await driver.switchTo().alert().accept();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/section/ol/li/div[2]/div[1]')))

        await driver.sleep(2000);

    });

    it('Cerrar Navegador', async function () {
        await driver.quit();
    });

})