#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer'; //命令行答询
import ora from 'ora'; //命令行中加载状态标识
import chalk from 'chalk'; //命令行输出字符颜色
import logSymbols from 'log-symbols'; //命令行输出符号
import fs from 'fs';
import { exec } from 'child_process';
import { rimraf } from 'rimraf';



const templates = {
    vue: {
      url: "https://github.com/zhaoljgithub/vue-admin-template",
      downloadUrl: "https://github.com/zhaoljgithub/vue-admin-template.git",
      description: "vue admin脚手架测试模板",
    },
    react: {
      url: "https://github.com/zhaoljgithub/react-admin-template",
      downloadUrl: "https://github.com/zhaoljgithub/react-admin-template.git",
      description: "react admin脚手架模板",
    },
};
 

program
  .version('1.0.0', '-v, --version')
  .command('create <project>')
  .description('create a new project')
  .action((project) => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'author',
                message: 'Author name:'
            },
            {
                type: "input",
                name: "description",
                message: "请输入项目简介",
                default: "",
            },
            {
                type: 'list',
                name: 'template',
                message: 'Choose a template',
                choices: ['vue', 'react']
            }
        ])
        .then((answers) => {
            console.log(answers)
            const { author, template } = answers
            const { downloadUrl } = templates[template];
            const spinner = ora("正在下载模板...").start();
            try {
                exec(`git clone -b master ${downloadUrl} ${project}`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(
                            logSymbols.error,
                            chalk.red(error)
                        );
                        spinner.fail("项目模板下载失败");
                    } else {
                        spinner.succeed("项目模板下载成功");
                        rimraf(`${project}/.git`)
                        
                        //根据命令行答询结果修改package.json文件
                        let packsgeContent = fs.readFileSync(
                            `${project}/package.json`,
                            "utf8"
                        );
                        const modifyContent = {name: project, ...answers}
                        if (packsgeContent) {
                            const jsonPacksgeContent = JSON.parse(packsgeContent);
                            let packageResult = { ...jsonPacksgeContent, ...modifyContent };
                            fs.writeFileSync(`${project}/package.json`, JSON.stringify(packageResult, null, 2));

                        }
                        //用chalk和log-symbols改变命令行输出样式
                        console.log(
                            logSymbols.success,
                            chalk.green(project + "工程初始化成功")
                        );
                    }
                });
            } catch (error) {
                console.log(error);
                spinner.fail("项目模板下载失败");
            }
        });
    });
program.parse(process.argv);