const remote = require('@electron/remote');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const App = {
    data() {
        return {
            folderPath:'',  //当前文件夹路径
            segTableData: [],
            isSameFold:false, //是否还是在这个文件夹的图片
            imagePath: '',  //处理的图片路径
            isModifyDpi: false, //是否修改dpi
            inputDpi:{density:300}, //设置dpi,若选择修改dpi,默认设置300dpi
            //若选择修改分辨率，分辨率默认为413x579
            isModifyWH:false, //是否修改分辨率
            imgWidth:413,
            imgHeight:579,
            isModifyQuality:false,
            quality:100,//图片质量，默认不压缩，即100
        };
    },
    methods: {
        async modifyDpi() {
            remote.dialog
                .showOpenDialog({
                    properties: ['openDirectory'],
                })
                .then((result) => {
                    //初始化所有设置
                    this.isSameFold=false;
                    if (!result.canceled) {
                        // 重新导入，清空原有数据
                        this.folderPath = result.filePaths[0];
                        // 读取文件夹
                        fs.promises.readdir(result.filePaths[0])
                            .then(files => {
                                console.log("dpi,imagePath:",this.folderPath);
                            //readdir()回调获得两个参数（err，files），其中文件是目录中文件名称的数组，不包括'.'和'..'
                                // 检查文件夹中是否有图片
                                let cnt=0;
                                files.forEach( file => {
                                    if (path.extname(file).toLowerCase() === ".png"
                                        || path.extname(file).toLowerCase() === ".jpg"
                                        || path.extname(file).toLowerCase() === ".jpeg"
                                        || path.extname(file).toLowerCase() === ".tif") {
                                        cnt++;
                                        console.log("cnt",cnt)
                                        let images = sharp(path.join(this.folderPath,file));
                                        console.log("typeofimages",typeof images)
                                        //
                                        // console.log("imagespath: ", path.join(this.folderPath+'dpi',file))
                                        let dirExtname='/'+this.inputDpi.density+'dpi'
                                        fs.mkdir(path.join(this.folderPath,dirExtname),function(err){
                                            if(err) return;
                                            console.log('创建目录成功');
                                        })
                                        let options={}
                                        images.metadata().then(info => {
                                            options=info
                                            console.log("metadata",info)
                                        })
                                        options.density=this.inputDpi.density
                                        //修改分辨率dpi
                                        //测试修改图片dpi
                                        if(this.isModifyDpi)
                                            images=images.withMetadata(options)
                                        if(this.isModifyWH)
                                            images=images.resize(this.imgWidth,this.imgHeight)
                                        images //设置压缩质量: 0-100
                                            .jpeg({quality:this.quality})//设置1-100，图片质量压缩，若不设置底层默认是80，Quality, integer 1-100 (optional, default 80)
                                            .toFile(path.join(path.join(this.folderPath,dirExtname),file))
                                            .then(info => {
                                                if(this.isSameFold===false) {
                                                    ElementPlus.ElMessage({
                                                        message: '图片修改成果，已保存至'+path.join(this.folderPath,dirExtname),
                                                        type: 'success',
                                                        center: true,
                                                    })
                                                }
                                                this.isSameFold=true;
                                            })
                                            .catch(err => {
                                                if(this.isSameFold===false) {
                                                    ElementPlus.ElMessage({
                                                        message: '出错了',
                                                        type: 'error',
                                                        center: true,
                                                    })
                                                }
                                                this.isSameFold=true;
                                            });
                                    }
                                })

                            }).catch(err => {
                            console.log(err)
                        })
                    }
                })



        }
    }
};
document.querySelectorAll(".calibre_3").forEach(e=>{
    e.style.paddingLeft='190px';
    e.style.background="#111";
    e.style.color="#ddd"
    e.style.fontSize="1.2rem"
    e.style.paddingRight="290px"
});
const app = Vue.createApp(App);
// import icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)
    ) {
    app.component(key, component)
}
app.use(ElementPlus);
app.mount("#app");