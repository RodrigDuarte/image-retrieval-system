const search_input = document.getElementById('search_input');
const search_button = document.getElementById('search_button');
const search_form = document.getElementById('search_form');
const max_results_select = document.getElementById('max_results_select');
const loading_indicator = document.getElementById('loading');
const no_results = document.getElementById('no_results');
const results_list = document.getElementById('results_list');
const results_container = document.getElementById('results_container');

let is_hybrid_search = false;
let search_toggle_button = null;
let hybrid_function_select = null;

document.addEventListener('DOMContentLoaded', function() {
    initialize_search();
});

function initialize_search() {
    create_search_toggle();
    create_hybrid_function_selector();
    setup_event_listeners();
    hide_all_result_elements();
}

function create_search_toggle() {
    const toggle_container = document.createElement('div');
    toggle_container.className = 'search-toggle-container';
    
    search_toggle_button = document.createElement('button');
    search_toggle_button.className = 'search-toggle';
    search_toggle_button.id = 'search_toggle';
    search_toggle_button.title = 'Toggle search mode';
    
    const toggle_text = document.createElement('span');
    toggle_text.id = 'search_toggle_text';
    toggle_text.textContent = 'Normal';
    
    search_toggle_button.appendChild(toggle_text);
    toggle_container.appendChild(search_toggle_button);
    
    const search_toggle_container = document.getElementById('search_toggle_container');
    search_toggle_container.appendChild(toggle_container);
    
    search_toggle_button.addEventListener('click', toggle_search_mode);
}

function create_hybrid_function_selector() {
    const control_group = document.createElement('div');
    control_group.className = 'control-group';
    control_group.id = 'hybrid_function_group';
    control_group.style.display = 'none';
    
    const label = document.createElement('label');
    label.htmlFor = 'hybrid_function_select';
    label.className = 'control-label';
    label.textContent = 'Function:';
    
    hybrid_function_select = document.createElement('select');
    hybrid_function_select.id = 'hybrid_function_select';
    hybrid_function_select.className = 'control-select';
    
    const functions = [
        { value: 1, text: 'Linear Decay (Zero-indexed)' },
        { value: 2, text: 'Linear Decay (One-indexed)' },
        { value: 3, text: 'Square Root Decay' },
        { value: 4, text: 'Exponential Decay' }
    ];
    
    functions.forEach(func => {
        const option = document.createElement('option');
        option.value = func.value;
        option.textContent = func.text;
        if (func.value === 1) option.selected = true;
        hybrid_function_select.appendChild(option);
    });
    
    control_group.appendChild(label);
    control_group.appendChild(hybrid_function_select);
    
    const max_results_control = document.querySelector('#max_results_select').parentElement;
    max_results_control.parentElement.appendChild(control_group);
}

function setup_event_listeners() {
    search_button.addEventListener('click', perform_search);
    
    search_input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            perform_search();
        }
    });
    
    search_input.addEventListener('input', function() {
        if (search_input.value.trim() === '') {
            clear_results();
        }
    });
    
    max_results_select.addEventListener('change', function() {
        clear_results();
    });
}

function toggle_search_mode() {
    is_hybrid_search = !is_hybrid_search;
    
    const toggle_text = document.getElementById('search_toggle_text');
    const search_input_placeholder = search_input;
    const hybrid_function_group = document.getElementById('hybrid_function_group');
    
    if (is_hybrid_search) {
        toggle_text.textContent = 'Hybrid';
        search_toggle_button.classList.add('hybrid-mode');
        search_input_placeholder.placeholder = 'Enter hybrid search query...';
        hybrid_function_group.style.display = 'flex';
    } else {
        toggle_text.textContent = 'Normal';
        search_toggle_button.classList.remove('hybrid-mode');
        search_input_placeholder.placeholder = 'Search for images...';
        hybrid_function_group.style.display = 'none';
    }
    
    clear_results();
}

async function perform_search() {
    const query = search_input.value.trim();
    const max_results = parseInt(max_results_select.value);
    const hybrid_function = is_hybrid_search ? parseInt(hybrid_function_select.value) : 1;
    
    if (!query) {
        show_error_message('Please enter a search query');
        return;
    }
    
    try {
        show_loading();
        
        const endpoint = is_hybrid_search ? '/search_complex' : '/search';
        const body_data = { 
            query: query,
            max_results: max_results
        };
        
        if (is_hybrid_search) {
            body_data.hybrid_function = hybrid_function;
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body_data),
            skipNotification: true
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        display_results(data);
        
    } catch (error) {
        console.error('Search failed:', error);
        show_error_message(`Search failed: ${error.message}`);
    } finally {
        hide_loading();
    }
}

function display_results(data) {
    console.log('Received data:', data);
    console.log('Results structure:', data.results);
    
    if (data.warning) {
        show_warning_message(data.warning);
    }
    
    if (!data.results || data.total === 0) {
        show_no_results();
        return;
    }
    
    if (is_hybrid_search) {
        display_normal_results(data);
    } else {
        display_normal_results(data);
    }
}

function display_normal_results(data) {
    results_list.innerHTML = '';
    
    data.results.forEach((result, index) => {
        console.log(`Result ${index}:`, result);
        const result_item = create_normal_result_item(result, index);
        results_list.appendChild(result_item);
    });
    
    show_results();
}

function display_complex_results(data) {
    results_list.innerHTML = '';
    
    if (data.search_type === 'image_fallback') {
        data.results.forEach((result, index) => {
            console.log(`Fallback result ${index}:`, result);
            const result_item = create_normal_result_item(result, index);
            results_list.appendChild(result_item);
        });
    } else {
        if (data.results.hash) {
            Object.entries(data.results.hash).forEach(([hash, info], index) => {
                const result_item = create_hybrid_result_item(hash, info, index);
                results_list.appendChild(result_item);
            });
        }
    }
    
    show_results();
}

function create_normal_result_item(result, index) {
    const result_item = document.createElement('div');
    result_item.className = 'result-item';
    result_item.setAttribute('data-index', index);
    
    const result_image = document.createElement('div');
    result_image.className = 'result-image';
    
    const img = document.createElement('img');
    img.src = result.url || `/image/${result.hash || result.id}`;
    img.alt = result.hash || 'Search result';
    img.className = 'result-img';
    img.loading = 'lazy';
    
    img.onerror = function() {
        console.warn('Failed to load image:', result.url);
        this.style.display = 'none';
    };
    
    result_image.appendChild(img);
    
    const result_info = document.createElement('div');
    result_info.className = 'result-info';
    
    const result_title = document.createElement('div');
    result_title.className = 'result-title';
    result_title.textContent = result.hash || 'Unknown';
    
    const result_score = document.createElement('div');
    result_score.className = 'result-score';
    const score_value = parseFloat(result.score) || 0;
    result_score.textContent = `Score: ${score_value.toFixed(3)}`;
    
    const result_id = document.createElement('div');
    result_id.className = 'result-id';
    result_id.textContent = `ID: ${result.id || result.hash || 'Unknown'}`;
    
    result_info.appendChild(result_title);
    result_info.appendChild(result_score);
    result_info.appendChild(result_id);
    
    result_item.appendChild(result_image);
    result_item.appendChild(result_info);
    
    return result_item;
}

function create_hybrid_result_item(hash, info, index) {
    const result_item = document.createElement('div');
    result_item.className = 'result-item hybrid-result';
    result_item.setAttribute('data-index', index);
    result_item.setAttribute('data-hash', hash);
    
    const result_image = document.createElement('div');
    result_image.className = 'result-image';
    
    const img = document.createElement('img');
    img.src = info.url || `/image/${hash}`;
    img.alt = `Hybrid search result ${hash}`;
    img.className = 'result-img';
    img.loading = 'lazy';
    
    result_image.appendChild(img);
    
    const result_info = document.createElement('div');
    result_info.className = 'result-info';
    
    const result_hash = document.createElement('div');
    result_hash.className = 'result-title';
    result_hash.textContent = `Hash: ${hash.substring(0, 12)}...`;
    
    const result_details = document.createElement('div');
    result_details.className = 'result-details';
    result_details.textContent = typeof info === 'object' ? 
        JSON.stringify(info) : 
        String(info);
    
    result_info.appendChild(result_hash);
    result_info.appendChild(result_details);
    
    result_item.appendChild(result_image);
    result_item.appendChild(result_info);
    
    return result_item;
}

function show_loading() {
    hide_all_result_elements();
    loading_indicator.style.display = 'flex';
    search_button.disabled = true;
    search_button.textContent = 'Searching...';
}

function hide_loading() {
    loading_indicator.style.display = 'none';
    search_button.disabled = false;
    search_button.textContent = 'Search';
}

function show_results() {
    hide_all_result_elements();
    results_list.style.display = 'flex';
}

function show_no_results() {
    hide_all_result_elements();
    no_results.style.display = 'block';
}

function show_error_message(message) {
    hide_all_result_elements();
    showError('Search Error', message);
}

function show_warning_message(warning) {
    let message = warning.message;
    if (warning.reason) {
        message += ` (${warning.reason})`;
    }
    
    showWarning('Search Warning', message);
}

function clear_results() {
    hide_all_result_elements();
    results_list.innerHTML = '';
}

function hide_all_result_elements() {
    loading_indicator.style.display = 'none';
    no_results.style.display = 'none';
    results_list.style.display = 'none';
}

function get_search_mode() {
    return is_hybrid_search ? 'hybrid' : 'normal';
}

window.SearchModule = {
    perform_search,
    toggle_search_mode,
    get_search_mode,
    clear_results
};
