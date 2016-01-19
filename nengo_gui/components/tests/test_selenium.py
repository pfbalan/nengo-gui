from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains
import time
import pytest
from nengo_gui import conftest
from nengo_gui import testing_tools as tt
import os

test_files = tt.folder_location('examples/basics')

@pytest.mark.parametrize('test_file',test_files)
def test_basic_functionality(driver,test_file):
	#Test page response by clicking the reset button and applying new code to ace-editor
	tt.reset_page(driver)
	tt.update_editor(driver,test_file)
	ens_elements = driver.find_elements_by_xpath('//*[@class="ens"]')
	assert len(ens_elements) > 0
	tt.mouse_scroll(driver,500)
	time.sleep(2)

	#captures pictures in stdout
	

	#Creates graph objects by right clicking on nodes and selecting from menu
	actions = ActionChains(driver)
	elements = ['node','ens']
	for elem in elements:
		node = driver.find_element_by_xpath('//*[@class="'+elem+'"]')
		actions = ActionChains(driver)
		actions.move_to_element(node)
		actions.context_click()
		actions.perform()
		time.sleep(0.5)
		menu = driver.find_element_by_xpath('//*[@class="dropdown-menu"]/li[1]').click()
		time.sleep(0.5)
	graph_elements = driver.find_elements_by_xpath('//*[@class="graph"]')

	assert len(graph_elements) > 0

	#Tests GUI response by dragging the graph objects
	# x_disp = -10
	# y_disp = -10
	# nodes = driver.find_elements_by_xpath('//*[@class="graph"]')
	# for count, graph_node in enumerate(nodes):
	# 	actions = ActionChains(driver)
	# 	init_x = graph_node.location['x']
	# 	init_y = graph_node.location['y']
	# 	actions.drag_and_drop_by_offset(graph_node,x_disp,y_disp).perform()
	# 	time.sleep(1)
	# 	final_x = graph_node.location['x']
	# 	final_y = graph_node.location['y']
		
	# 	assert final_x != init_x
	# 	assert final_y != init_y
	
	#Runs the simulations for a few seconds

	tt.start_stop_sim(driver)
	time.sleep(1.5)
	tt.start_stop_sim(driver)
	time.sleep(0.5)
	if(os.environ['TRAVIS']):
		import pyimgur
		driver.get_screenshot_as_file('test_result.png')
		client_id = 'ce3e3bc9c9f0af0'
		client_secret = 'b033592e871bd14ac89d3e7356d8d96691713170'
		im = pyimgur.Imgur(client_id,client_secret)

		current_folder = os.getcwd()
		PATH = os.path.join(current_folder, 'test_result.png')
		uploaded_image = im.upload_image(PATH, title="Uploaded with PyImgur")

		print(uploaded_image.title)
		print(uploaded_image.link)


	

    