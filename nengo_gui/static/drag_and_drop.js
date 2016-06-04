$(".draggable").draggable({
    helper: "clone",
    appendTo: "#main",
    cursorAt: {top: 60, left: 60},
});

$( ".droppable" ).droppable({
    drop: function( event, ui ) {
        var draggableId = ui.draggable.attr("id");
        var width = $(".tab-content")[0].offsetWidth;
        if (event.clientX > width + 50) {
            add_component(draggableId,event);
        }

        setTimeout( function() {
            var body = document.getElementById('body');
            body.removeAttribute("style");
        }, 100);
    }
});

function add_component(type, event) {
    var tab = "    ";
    var ng = Nengo.netgraph;
    var editor = ace.edit('editor');
    var code = editor.getValue();
    var last_line = editor.session.getLength();

    var obj_names = ng.svg_objects;
    var names = [];

    var component_code = "";
    var component_name = "";
    var code_str = "";

    for (var key in obj_names) {
        names.push(key);
    }

    if (type == "Ensemble") {
        component_name = open_name('ensemble');
        code_str = " = nengo.Ensemble(n_neurons=50, dimensions=1)\n";
    } else if (type = "Node") {
        component_name = open_name('stim');
        code_str = " = nengo.Node([0])\n";
    }
    component_code = component_name + code_str;
    ng.override_positions[component_name] = compute_position(event);
    editor.gotoLine(last_line);
    editor.insert(tab + component_code);
    obj_names = ng.svg_objects;
}

function compute_position(event) {
    var ng = Nengo.netgraph;
    var pos = [];
    //Handles mouse position Transform
    var w = ng.get_scaled_width();
    var offsetX = ng.offsetX * w;
    var h = ng.get_scaled_height();
    var offsetY = ng.offsetY * h;
    pos[0] = (event.clientX - offsetX) / w;
    pos[1] = (event.clientY - 30 - offsetY) / h;
    return pos;
}

function open_name(name) {
    var num = 1;
    while (Nengo.netgraph.svg_objects.hasOwnProperty(name + num) === true) {
        num ++;
    }
    return name + num;
}