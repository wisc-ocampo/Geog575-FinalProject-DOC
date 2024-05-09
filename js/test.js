// SEQUENCE CONTROLS
function createSequenceControls(){
    var container = L.DomUtil.create('div', 'sequence-control-container');
    //add label
            container.insertAdjacentHTML('beforeend', '<h3>Sequence by month</h3> </button>'); 
            
            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">');
            container.querySelector(".range-slider").max = 240;
            container.querySelector(".range-slider").min = 1;
            container.querySelector(".range-slider").value = 1;
            container.querySelector(".range-slider").step = 1;

            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse"><</button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward">></button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }


    //click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
    
        step.addEventListener("input", function(){
        var index = document.querySelector('.range-slider').value;
            
        //Step 6: increment or decrement depending on button clicked
        if (step.id == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 240 ? 1 : index;
        } else if (step.id == 'reverse'){
           index--;
           //Step 7: if past the first attribute, wrap around to last attribute
           index = index < 1 ? 240 : index;
       };
            
        //Step 8: update slider
        document.querySelector('.range-slider').value = index;
        
        updateMapUnits(index);        
        })
        
    
    })
            
    //input listener for slider
//    document.querySelector('.range-slider').addEventListener('input', function(){            
    d3.select('range-slider')
    .on("input", (event, d) => {
        var index = this.value;
        updateMapUnits(index);
    });
   

