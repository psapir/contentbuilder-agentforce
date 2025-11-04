var agentforceResults = [];
var promptVar,variationsVar,tagVar;

$(function(){
    var sdk = new SDK({
        blockEditorWidth: 600,
        tabs: [
            'htmlblock',  
            'stylingblock'  
        ]
    });

    sdk.getData(function (data) {
        promptVar = data.prompt;
        agentforceResults = data.results;
        variationsVar = data.variations;
        tagVar = data.tag; 

        $('#txt-prompt').val(promptVar);
        $('#txt-variations').val(variationsVar);
        $('#txt-tag').val(tagVar);
    });

    $('#btn-generate').on("click",function(event){
        
        event.preventDefault();

        $('#spinner').show();
        $('#pnl-results').hide();

        promptVar = $('#txt-prompt').val();
        variationsVar = $('#txt-variations').val();
        tagVar = $('#txt-tag').val();

        $.ajax({
            url: '/agentforce/getResults',
            method: 'POST',
            data:{
                prompt :`Provide ${variationsVar} alternatives for this text: ${promptVar}`
            },
            success(results){
                agentforceResults = [];
                results.forEach(choice => {
                    var resultText = choice.text.replace('"','');
                    $('#lst-results').append('<li class="slds-item">' + resultText + '</li>');
                    agentforceResults.push(resultText);
                    $('#pnl-results').show();
                    $('#spinner').hide();
                });
            }
        });
        
    });

    $('#btn-use-results').on("click",function(event){
        event.preventDefault();

        sdk.setData({
            prompt:  promptVar,
            results : agentforceResults,
            variations : variationsVar,
            tag : tagVar
        });

        var contentBlockContent = '<script runat=server> \n\
            Platform.Load("Core","1"); \n \
            \n\
                    var generatedContentRows = ['+generateResultsArray()+']; \n\
                    var variation = Math.floor(Math.random() * '+ variationsVar +'); \n\
                    var text = generatedContentRows[variation]; \n\
                    Variable.SetValue("@generatedContent", text); \n\
                    if(variation == 0) \n\
                    Variable.SetValue("@generatedContentAlias", "'+ tagVar +'" + "-default"); \n\
                    else \n\
                    Variable.SetValue("@generatedContentAlias", "'+ tagVar +'" + "-" + (variation+1)); \n\
        </script> \n\
        %%=v(@generatedContent)=%%';
        
        sdk.setContent(contentBlockContent);

    });

})

function generateResultsArray(){
    var textArray = '"'+promptVar+'",';
    for (let index = 0; index < agentforceResults.length; index++) {
        textArray += '"'+agentforceResults[index].trim()+'"';
        if(index < agentforceResults.length - 1)
            textArray += ',';
    }
    return textArray;
}