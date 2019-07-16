# Render the table of genes
    output$geneselectiontable <- renderUI({
        genes <- selectedGene()
        
        trows <- unlist(lapply(genes, function(x) {
            paste0('
                <tr>
                  <td style="padding:0px 8px;">', x, '</td>
                  <td class="checkbox">', tags$input(type="checkbox", name=ns("reportlolliplots"), value=x), '</td>
                  <td class="checkbox">', tags$input(type="checkbox", name=ns("reportboxplots"), value=x), '</td>
                  <td class="checkbox">', tags$input(type="checkbox", name=ns("reporthistograms"), value=x), '</td>
                </tr>'
            )
        }))


        tab <- paste0('
            <table id="', ns("reportgenegrouptable"), '">
              <thead><tr>
                <th>Gene Symbol</th>
                <th>Lollipop Plot</th>
                <th>Boxplot</th>
                <th>Histogram</th>
              </tr></thead>' ,
              paste(trows, collapse=" "), '
            </table>'
        )
        
        div(id=ns("reportlolliplots"), class="form-group shiny-input-checkboxgroup shiny-input-container",
            div(id=ns("reportboxplots"), class="form-group shiny-input-checkboxgroup shiny-input-container",
                div(id=ns("reporthistograms"), class="form-group shiny-input-checkboxgroup shiny-input-container",
                    HTML(tab)
                )
            )
        )
    })

    # Update which expression plots to include
    observe({
        reportGenes$boxplots
        reportGenes$histograms
        reportGenes$lolliplots
        genes <- selectedGene()
        isolate({
            if(length(genes)) {
                boxplotsalreadyselected <- reportGenes$boxplots
                if(length(boxplotsalreadyselected)) session$sendCustomMessage("updateCheckGroup", message=list(id=ns("reportboxplots"), value=boxplotsalreadyselected))
                
                histogramsalreadyselected <- reportGenes$histograms
                if(length(histogramsalreadyselected)) session$sendCustomMessage("updateCheckGroup", message=list(id=ns("reporthistograms"), value=histogramsalreadyselected))
                
                lolliplotsalreadyselected <- reportGenes$lolliplots
                if(length(lolliplotsalreadyselected)) session$sendCustomMessage("updateCheckGroup", message=list(id=ns("reportlolliplots"), value=lolliplotsalreadyselected))
            }
        })
    }, priority=1000)
    

// Escape jQuery selector metacharacters: !"#$%&'()*+,./:;<=>?@[\]^`{|}~
var exports = window.Shiny = window.Shiny || {};
var $escape = exports.$escape = function(val) {
  return val.replace(/([!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~])/g, '\\$1');
}; 
    
Shiny.addCustomMessageHandler("updateCheckGroup",
  function(message) {
    var el = $(message.id + '.shiny-input-checkboxgroup');
    // Clear all checkboxes
    $('input:checkbox[name="' + message.id + '"]').prop('checked', false);
    var value = message.value;
    // Accept array
    if (value instanceof Array) {
      for (var i = 0; i < value.length; i++) {
        $('input:checkbox[name="' + message.id + '"][value="' + value[i] + '"]')
          .prop('checked', true);
      }
    // Else assume it's a single value
    } else {
      $('input:checkbox[name="' + message.id + '"][value="' + value + '"]')
        .prop('checked', true);
    }

  }
)


setValue: function(el, value) {
    // Clear all checkboxes
    $('input:checkbox[name="' + $escape(el.id) + '"]').prop('checked', false);

    // Accept array
    if (value instanceof Array) {
      for (var i = 0; i < value.length; i++) {
        $('input:checkbox[name="' + $escape(el.id) + '"][value="' + $escape(value[i]) + '"]')
          .prop('checked', true);
      }
    // Else assume it's a single value
    } else {
      $('input:checkbox[name="' + $escape(el.id) + '"][value="' + $escape(value) + '"]')
        .prop('checked', true);
    }

  }
