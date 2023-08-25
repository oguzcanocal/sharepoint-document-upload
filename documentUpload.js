//GEREKLİLİKLER;
//-- Kodu çalıştırmadan önce Sharepoint'te SiteAssets adında bir döküman kütüphanesi oluşturulmalıdır.
//-- NewItem.aspx'te bulunan SITEURL ve ListID parametrelerinin sharepointte göre konfigurasyonu yapılmalıdır.
//-- NewItem.aspx'in kullanılacağı listeye "Imagepath" adında bir site column eklenmelidir.

//KODUN ÇALIŞMA PRENSİBİ:
//-- NewItem.aspx sayfasına eklediğimiz file inputtan(ID = "getFile") yüklediğin görseli alıp Sharepointte SiteAssets altına kaydetmektedir.
//-- Kayıt işleminden sonra görselin pathini file Inputun altunda bulunan text inputuna(Class = imageUnput) basmaktadır.
//-- Kaydetmeden önce dökümanda türkçe karakter kullanıldıysa kullanıcıya alert atmaktadır.
//-- Ayrıca SiteAssets altında aynı isimde başka bir döküman kayıtlıysa kullanıcıya alert atarak görselin ismini değiştirimesini istemektedir.(Override'ı engellemek için)

//UYARI:
//-- Kod sharepointte liste kullanılarak geliştirilmiştir. Eğer page yapısı veya webpart yapısı kullanılacaksa kodun yapısı değiştirilmelidir.

$(document).ready(function () {

	
	$("#getFile").change(function () {
		CustomForm.imageUploadAndCheckRules("getFile","imageInput");
    });
	
})

CustomForm = {

    VARIABLES: {


		imagePath: "/SiteAssets/"
    },
	
	
	imageUploadAndCheckRules: function (fileId,imageInputClass) {
        //fileInput.removeAttribute("edit");
        var element = document.getElementById(fileId);
        var file = element.files[0];
        var parts = element.value.split("\\");
        var fileName = parts[parts.length - 1];
        if (fileName.match(/\s/gi) == null) {
            if (fileName.match(/[şçöğüıŞÇÖĞÜİ]/) == null && fileName.match(/^[\w.\_\-]+$/) != null) {

                var clientContext = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
                var oWeb = clientContext.get_web();
                var url = CustomForm.VARIABLES.imagePath + fileName;
                var ofile = oWeb.getFileByServerRelativeUrl(url);
                clientContext.load(ofile);
                clientContext.executeQueryAsync(
                    Function.createDelegate(this, function () {
                        /* File exists! */
                        alert("Bu isimle görsel mevcut, lütfen görsel ismini değiştirin");
                        document.getElementById(fileId).val("");
                    }),
                    Function.createDelegate(this, function (sender, args) {
                        /* File doesn't exist. */
                        $("."+imageInputClass+" input").val(CustomForm.VARIABLES.imagePath + fileName);
						CustomForm.imageUpload(fileId);

                    })
                );
            }
            else {
                alert("Görsel isminde özel karakter, Türkçe karakter veya boşluk bulunamaz.")
                $("#"+fileId).val("");
            }
        }
        else {
            alert("Görsel isminde özel karakter, Türkçe karakter veya boşluk bulunamaz.")
            $("#"+fileId).val("");
        }
	},
	
	imageUpload: function(fileId){
		
		if (document.getElementById(fileId).files.length > 0) {
			var element = document.getElementById(fileId);
			var file = element.files[0];
			var parts = element.value.split("\\");
			var fileName = parts[parts.length - 1];
			//Read File contents using file reader  
			var reader = new FileReader();

			//  reader.readAsArrayBuffer(file);
			reader.onload = function (e) {
				CustomForm.uploadFileV2(e.target.result, fileName, CustomForm.VARIABLES.imagePath);
			}
			reader.onerror = function (e) {
				alert(e.target.error);
			}
			reader.readAsArrayBuffer(file);
		}

	},

	uploadFileV2: function(buffer, fileName, imagePath) {

    
    var fileCollectionEndpoint = String.format(
        "{0}/_api/web/GetFolderByServerRelativeUrl('{1}')/files/add(overwrite=true,url='{2}')",
        _spPageContextInfo.siteAbsoluteUrl, imagePath, fileName);

    $.ajax({
        url: fileCollectionEndpoint,
        type: "POST",
        async: false,
        data: buffer,
        processData: false,
        contentType: false,
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {

            check = true;
            console.log('Basarili')
            alert("The upload has been changed.");
        },
        error: function (error) {

            alert("Görsel yüklenirken hata oluştu.")
        }
    });

}
	
}
